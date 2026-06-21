import os
import re
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="Made In Veedu AI Microservice", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def read_root():
    return {
        "message": "Made In Veedu AI Microservice is running successfully.",
        "endpoints": {
            "recommendations": "POST /recommend",
            "search": "POST /search",
            "chatbot": "POST /chat",
            "api_documentation": "GET /docs"
        }
    }
# Database Setup
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:rootpassword@localhost:3306/madeinveedu")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Request Pydantic Models
class RecommendRequest(BaseModel):
    user_id: Optional[int] = None

class SearchRequest(BaseModel):
    query: str

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[int] = None

# Recommendation Helper
def get_recommendations(user_id: Optional[int], db: Session):
    # Fetch all products
    products_query = db.execute(text("SELECT id, name, description, category, offer_price, sold_quantity, image_url FROM products")).fetchall()
    if not products_query:
        return []
    
    products_df = pd.DataFrame(products_query, columns=["id", "name", "description", "category", "offer_price", "sold_quantity", "image_url"])
    
    # Simple Content-Based Filtering fallback
    products_df['content'] = products_df['name'] + " " + products_df['description'] + " " + products_df['category']
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(products_df['content'])
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    # 1. Personalized logic based on purchase history
    if user_id:
        orders_query = db.execute(text(
            "SELECT p.id, p.category FROM orders o "
            "JOIN order_items oi ON o.id = oi.order_id "
            "JOIN products p ON oi.product_id = p.id "
            "WHERE o.user_id = :user_id AND o.status != 'Cancel'"
        ), {"user_id": user_id}).fetchall()
        
        if orders_query:
            purchased_ids = [r[0] for r in orders_query]
            purchased_categories = [r[1] for r in orders_query]
            
            # Find most common category
            fav_category = max(set(purchased_categories), key=purchased_categories.count)
            
            # Recommend popular items in their favorite category they haven't bought yet
            rec_df = products_df[
                (~products_df['id'].isin(purchased_ids)) & 
                (products_df['category'] == fav_category)
            ].sort_values(by='sold_quantity', ascending=False)
            
            if len(rec_df) >= 3:
                return rec_df.head(4).to_dict(orient="records")
            
            # If not enough category matches, recommend similar products based on what they bought
            sim_scores = []
            for pid in purchased_ids:
                try:
                    idx = products_df[products_df['id'] == pid].index[0]
                    sim_scores.extend(list(enumerate(cosine_sim[idx])))
                except IndexError:
                    continue
            
            # Sort by similarity score
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
            similar_indices = [i[0] for i in sim_scores if i[0] not in purchased_ids]
            
            # Unique values
            seen = set()
            unique_indices = []
            for i in similar_indices:
                if i not in seen:
                    seen.add(i)
                    unique_indices.append(i)
            
            recommended_products = products_df.iloc[unique_indices].head(4)
            return recommended_products.to_dict(orient="records")

    # 2. General Popularity fallback (most sold products)
    popular_df = products_df.sort_values(by='sold_quantity', ascending=False).head(4)
    return popular_df.to_dict(orient="records")

def to_camel_case(d):
    camel_dict = {}
    for k, v in d.items():
        parts = k.split('_')
        camel_key = parts[0] + ''.join(x.title() for x in parts[1:])
        camel_dict[camel_key] = v
        # Also preserve original snake_case for compatibility
        camel_dict[k] = v
    return camel_dict

@app.post("/recommend")
def recommend_products(request: RecommendRequest, db: Session = Depends(get_db)):
    try:
        recs = get_recommendations(request.user_id, db)
        recs_camel = [to_camel_case(r) for r in recs]
        return {"recommendations": recs_camel}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
def smart_search(request: SearchRequest, db: Session = Depends(get_db)):
    query = request.query.lower()
    
    # Fetch all products
    products_query = db.execute(text("SELECT id, name, description, category, original_price, offer_price, image_url, available_quantity FROM products")).fetchall()
    if not products_query:
        return {"results": []}
        
    products_df = pd.DataFrame(products_query, columns=["id", "name", "description", "category", "original_price", "offer_price", "image_url", "available_quantity"])
    
    # 1. Check for Price Limits (e.g. "under 250", "below ₹200")
    price_limit = None
    price_match = re.search(r'(?:under|below|less than|within|price of|rs\.?|₹)\s*(\d+)', query)
    if price_match:
        price_limit = float(price_match.group(1))

    # 2. Check for keywords
    has_healthy = "healthy" in query or "health" in query or "nutrition" in query
    has_masala = "masala" in query or "powder" in query or "spice" in query
    has_chips = "chips" in query or "snack" in query or "banana" in query or "maravalli" in query

    filtered_df = products_df.copy()

    # Apply filters
    if price_limit:
        filtered_df = filtered_df[filtered_df['offer_price'] <= price_limit]
    
    if has_healthy:
        filtered_df = filtered_df[filtered_df['category'] == 'Health Mixes']
    elif has_masala:
        filtered_df = filtered_df[filtered_df['category'] == 'Organic Masalas']
    elif has_chips:
        filtered_df = filtered_df[filtered_df['category'] == 'Traditional Snacks']
    else:
        # standard textual match fallback
        filtered_df = filtered_df[
            filtered_df['name'].str.lower().str.contains(query) | 
            filtered_df['description'].str.lower().str.contains(query)
        ]

    # Return matching list
    results = filtered_df.to_dict(orient="records")
    results_camel = [to_camel_case(r) for r in results]
    return {"results": results_camel}

@app.post("/chat")
def chat_bot(request: ChatRequest, db: Session = Depends(get_db)):
    msg = request.message.lower()
    
    # Fetch products to reference them
    products_query = db.execute(text("SELECT id, name, offer_price, category FROM products")).fetchall()
    products = [{"id": r[0], "name": r[1], "price": float(r[2]), "category": r[3]} for r in products_query]
    
    # 1. Handling queries about specific product prices or details
    for p in products:
        if p["name"].lower() in msg:
            return {
                "reply": f"The **{p['name']}** is available in the **{p['category']}** category. Our offer price is **₹{p['price']}**. Would you like me to guide you to add it to your cart?"
            }

    # 2. Handle order tracking queries
    if "order" in msg or "track" in msg or "status" in msg:
        if request.user_id:
            # Fetch latest order
            latest_order = db.execute(
                text("SELECT order_number, status, total_amount FROM orders WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 1"),
                {"user_id": request.user_id}
            ).fetchone()
            
            if latest_order:
                return {
                    "reply": f"Your latest order is **{latest_order[0]}** for **₹{latest_order[2]}**. The current status is **'{latest_order[1]}'**. You can track this in the **Tracking** timeline on your dashboard!"
                }
            else:
                return {
                    "reply": "It looks like you haven't placed any orders yet. Once you order, you can track them right here!"
                }
        else:
            return {
                "reply": "Please login to track your active orders. Once logged in, I can retrieve your live shipment status!"
            }

    # 3. Shipping Rules
    if "ship" in msg or "deliver" in msg or "courier" in msg or "days" in msg:
        return {
            "reply": "We ship all orders within 24 hours of placement. Delivery takes **3-5 business days** across India. Shipping is completely free for orders above ₹500!"
        }

    # 4. Ingredients or health mix queries
    if "healthy" in msg or "health" in msg or "nutrition" in msg or "millet" in msg:
        health_products = [p["name"] for p in products if p["category"] == "Health Mixes"]
        return {
            "reply": f"Our **Health Mixes** are packed with 24 organic millets, pulses, and nuts, with no added white sugar or preservatives. Try our **{', '.join(health_products)}** for a perfect traditional breakfast!"
        }

    # 5. Coupon inquiries
    if "coupon" in msg or "discount" in msg or "offer" in msg:
        return {
            "reply": "You can use code **WELCOME20** to get **20% OFF** on your first order! We also have **HEALTH10** (10% off) for health mixes. Apply them on the Cart page before checking out!"
        }

    # 6. Default Fallback
    return {
        "reply": "I'm your **Made In Veedu Assistant**. I can help you find products, track order delivery timelines, explain coupons, or recommend snacks! Try asking: *'Show products under ₹250'* or *'Where is my order?'*"
    }
