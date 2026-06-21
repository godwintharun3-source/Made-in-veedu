-- USE madeinveedu;

-- Clear tables to prevent duplicates
DELETE FROM coupons;
DELETE FROM products;

-- Insert Seed Products
INSERT INTO products (name, description, total_quantity, sold_quantity, available_quantity, single_pack_price, original_price, offer_price, image_url, category) VALUES
('Coriander Powder', 'Freshly ground organic coriander powder prepared in traditional stone mills. Pack size: 250g.', 100, 0, 100, 200.00, 200.00, 159.00, '/images/coriander_powder.png', 'Organic Masalas'),
('Chilly Powder', 'Rich red organic chilly powder, ground to perfection for the authentic traditional spicy kick. Pack size: 250g.', 100, 0, 100, 260.00, 260.00, 209.00, '/images/chilly_powder.png', 'Organic Masalas'),
('Chicken 65 Masala', 'Authentic blend of traditional spices for making premium Chicken 65. Preservative-free. Pack size: 250g.', 150, 0, 150, 200.00, 200.00, 159.00, '/images/chicken_65_masala.png', 'Organic Masalas'),
('Cauliflower Fry Masala', 'Specially curated spice blend for crispy cauliflower fry (Gobi 65). Pack size: 250g.', 120, 0, 120, 190.00, 190.00, 149.00, '/images/cauliflower_fry_masala.png', 'Organic Masalas'),
('Health Mix (500g)', 'Nutritious health mix containing 24 organic millets, pulses, and nuts. Good for all ages. Pack size: 500g.', 200, 0, 200, 250.00, 250.00, 209.00, '/images/health_mix_500g.png', 'Health Mixes'),
('Health Mix (1kg)', 'Nutritious health mix containing 24 organic millets, pulses, and nuts. Good for all ages. Pack size: 1kg.', 150, 0, 150, 450.00, 450.00, 399.00, '/images/health_mix_1kg.png', 'Health Mixes'),
('Maravalli Chips', 'Crispy traditional tapioca chips fried in premium quality wood-pressed oil. Pack size: 250g.', 80, 0, 80, 160.00, 160.00, 99.00, '/images/maravalli_chips.png', 'Traditional Snacks'),
('Banana Chips', 'Traditional Kerala-style raw banana chips prepared using pure cold-pressed coconut oil. Pack size: 250g.', 100, 0, 100, 200.00, 200.00, 149.00, '/images/banana_chips.png', 'Traditional Snacks');

-- Seed Coupons
INSERT INTO coupons (code, discount_percentage, expiry_date, active) VALUES
('WELCOME20', 20, DATE_ADD(NOW(), INTERVAL 30 DAY), 1),
('HEALTH10', 10, DATE_ADD(NOW(), INTERVAL 60 DAY), 1),
('FESTIVE15', 15, DATE_ADD(NOW(), INTERVAL 15 DAY), 1);
