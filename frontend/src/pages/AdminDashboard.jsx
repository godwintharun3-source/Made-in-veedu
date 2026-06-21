import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShoppingBag, Truck, Tag, Mail, MessageSquare, Plus, Edit, Trash, Check, X, ShieldAlert, AlertTriangle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from 'recharts';
import GlassCard from '../components/GlassCard';
import axios from 'axios';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('overview'); // overview, users, products, orders, coupons, mail, contacts
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Lists
  const [usersList, setUsersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);
  const [contactsList, setContactsList] = useState([]);

  // Modal / Form state for Product creation & update
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // CREATE, UPDATE
  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    description: '',
    totalQuantity: 100,
    availableQuantity: 100,
    singlePackPrice: 200,
    originalPrice: 200,
    offerPrice: 159,
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80',
    category: 'Organic Masalas'
  });

  // Coupon Form state
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountPercentage: 10,
    expiryDate: ''
  });

  // Bulk Email state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  const authHeader = {
    headers: { Authorization: `Bearer ${localStorage.getItem('miv_access_token')}` }
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      navigate('/login');
      return;
    }

    const loadStatsAndLists = async () => {
      try {
        const statsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/analytics`, authHeader);
        setStats(statsRes.data);

        const usersRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, authHeader);
        setUsersList(usersRes.data);

        const prodsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
        setProductsList(prodsRes.data);

        const ordersRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/orders`, authHeader);
        setOrdersList(ordersRes.data);

        const couponsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/coupons`, authHeader);
        setCouponsList(couponsRes.data);

        const contactsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/contacts`, authHeader);
        setContactsList(contactsRes.data);
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to fetch administrative records.');
      } finally {
        setLoading(false);
      }
    };

    loadStatsAndLists();
  }, [isAuthenticated, user, navigate, activeTab]);

  // Actions
  const handleToggleUserActive = async (id) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}/toggle-active`, {}, authHeader);
      setUsersList((prev) => prev.map((u) => u.id === id ? res.data : u));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this user account?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, authHeader);
      setUsersList((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete user account.");
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'CREATE') {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/products`, productForm, authHeader);
        setProductsList((prev) => [...prev, res.data]);
      } else {
        const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/products/${productForm.id}`, productForm, authHeader);
        setProductsList((prev) => prev.map((p) => p.id === productForm.id ? res.data : p));
      }
      setShowProductModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/products/${id}`, authHeader);
      setProductsList((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOrderStatusUpdate = async (id, status) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/orders/${id}/status`, { status }, authHeader);
      setOrdersList((prev) => prev.map((o) => o.id === id ? res.data : o));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this customer order?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/orders/${id}`, authHeader);
      setOrdersList((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete order.");
    }
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedDate = couponForm.expiryDate ? new Date(couponForm.expiryDate).toISOString() : new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
      const payload = {
        code: couponForm.code.toUpperCase(),
        discountPercentage: couponForm.discountPercentage,
        expiryDate: formattedDate
      };
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/coupons`, payload, authHeader);
      setCouponsList((prev) => [...prev, res.data]);
      setCouponForm({ code: '', discountPercentage: 10, expiryDate: '' });
    } catch (err) {
      alert("Coupon code already exists");
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/coupons/${id}`, authHeader);
      setCouponsList((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendBulkEmail = async (e) => {
    e.preventDefault();
    setEmailSuccess('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/bulk-email`, {
        subject: emailSubject,
        message: emailMessage
      }, authHeader);
      setEmailSuccess('Broadcast newsletter queued. Users will receive emails shortly.');
      setEmailSubject('');
      setEmailMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-400 text-sm">Loading admin dashboard records...</p>
      </div>
    );
  }

  // Format productPerformance for Recharts Bar Chart
  const productPerformanceChart = stats?.productPerformance
    ? Object.keys(stats.productPerformance).map((key) => ({
        name: key,
        sales: stats.productPerformance[key]
      }))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
          Admin Control Center
        </h1>
        <div className="text-xs text-slate-400 text-right">
          <p className="font-bold text-slate-700 dark:text-slate-300">Live Server Connected</p>
          <p className="mt-0.5">Veedu App v1.0.0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Sidebar Menu */}
        <div className="lg:col-span-1 space-y-2">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'overview' ? 'bg-brand text-white shadow-md' : 'bg-white/40 dark:bg-emerald-950/10 border border-slate-200/40 dark:border-emerald-950/20 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard size={16} /> Overview
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'products' ? 'bg-brand text-white shadow-md' : 'bg-white/40 dark:bg-emerald-950/10 border border-slate-200/40 dark:border-emerald-950/20 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag size={16} /> Products CRUD
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'orders' ? 'bg-brand text-white shadow-md' : 'bg-white/40 dark:bg-emerald-950/10 border border-slate-200/40 dark:border-emerald-950/20 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Truck size={16} /> Order Flows
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'users' ? 'bg-brand text-white shadow-md' : 'bg-white/40 dark:bg-emerald-950/10 border border-slate-200/40 dark:border-emerald-950/20 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Users size={16} /> Customers
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'coupons' ? 'bg-brand text-white shadow-md' : 'bg-white/40 dark:bg-emerald-950/10 border border-slate-200/40 dark:border-emerald-950/20 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Tag size={16} /> Coupons Rules
          </button>

          <button
            onClick={() => setActiveTab('mail')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'mail' ? 'bg-brand text-white shadow-md' : 'bg-white/40 dark:bg-emerald-950/10 border border-slate-200/40 dark:border-emerald-950/20 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Mail size={16} /> Bulk Mail
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'contacts' ? 'bg-brand text-white shadow-md' : 'bg-white/40 dark:bg-emerald-950/10 border border-slate-200/40 dark:border-emerald-950/20 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <MessageSquare size={16} /> Contacts ({contactsList.length})
          </button>

        </div>

        {/* Right Area: Control panels */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* A. OVERVIEW PANEL */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              
              {/* Stats Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <GlassCard className="p-5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Revenue</span>
                  <p className="text-xl font-extrabold text-brand dark:text-brand-light mt-1">₹{stats.totalRevenue}</p>
                </GlassCard>
                <GlassCard className="p-5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Orders Finished</span>
                  <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-1">{stats.totalSales}</p>
                </GlassCard>
                <GlassCard className="p-5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Products List</span>
                  <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-1">{stats.totalProducts}</p>
                </GlassCard>
                <GlassCard className="p-5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Active Users</span>
                  <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-1">{stats.totalUsers}</p>
                </GlassCard>
              </div>

              {/* Low stock inventory warning alerts */}
              {stats.inventoryAlerts.length > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-xs text-amber-600 font-semibold">
                  <AlertTriangle size={16} className="mt-0.5" />
                  <div>
                    <p className="font-bold">Inventory Stock Alerts ({stats.inventoryAlerts.length})</p>
                    <ul className="list-disc list-inside mt-1 font-medium text-slate-600 dark:text-slate-400">
                      {stats.inventoryAlerts.map((item) => (
                        <li key={item.id}>{item.name} is running low ({item.availableQuantity} items available)</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Sales Chart */}
              <GlassCard className="p-6">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-6">Revenue Over Time</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.revenueChartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="date" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="#4CAF50" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Product Performance Bar chart */}
              <GlassCard className="p-6">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-6">Product Performance (Quantities Sold)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productPerformanceChart}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" fontSize={9} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#81C784" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

            </div>
          )}

          {/* B. PRODUCTS CRUD PANEL */}
          {activeTab === 'products' && (
            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <ShoppingBag size={18} className="text-brand" /> Products Catalog Management
                </h3>
                <button
                  onClick={() => {
                    setModalMode('CREATE');
                    setProductForm({
                      id: null,
                      name: '',
                      description: '',
                      totalQuantity: 100,
                      availableQuantity: 100,
                      singlePackPrice: 200,
                      originalPrice: 200,
                      offerPrice: 159,
                      imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80',
                      category: 'Organic Masalas'
                    });
                    setShowProductModal(true);
                  }}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-dark transition-all active:scale-95"
                >
                  <Plus size={14} /> Add Product
                </button>
              </div>

              {/* Products listing */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-neutral-800 text-slate-400 font-bold">
                      <th className="py-3 px-2">Image</th>
                      <th className="py-3 px-2">Product Name</th>
                      <th className="py-3 px-2">Category</th>
                      <th className="py-3 px-2">Price</th>
                      <th className="py-3 px-2">Stock</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsList.map((p) => (
                      <tr key={p.id} className="border-b border-slate-100 dark:border-neutral-800/40 hover:bg-slate-50/40 dark:hover:bg-[#121f12]/10 transition-colors">
                        <td className="py-3 px-2">
                          <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded-lg shadow-sm" />
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-800 dark:text-slate-200">{p.name}</td>
                        <td className="py-3 px-2 text-slate-500">{p.category}</td>
                        <td className="py-3 px-2 font-bold text-brand">₹{p.offerPrice}</td>
                        <td className="py-3 px-2 text-slate-500">{p.availableQuantity} / {p.totalQuantity}</td>
                        <td className="py-3 px-2 text-right space-x-2">
                          <button
                            onClick={() => {
                              setModalMode('UPDATE');
                              setProductForm(p);
                              setShowProductModal(true);
                            }}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-500 hover:text-brand transition-colors inline-block"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-500 hover:text-rose-500 transition-colors inline-block"
                          >
                            <Trash size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {/* C. ORDERS MANAGEMENT FLOW */}
          {activeTab === 'orders' && (
            <GlassCard className="p-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-1.5">
                <Truck size={18} className="text-brand" /> Manage Customer Orders
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-neutral-800 text-slate-400">
                      <th className="py-3 px-2">Order #</th>
                      <th className="py-3 px-2">Customer & Contact</th>
                      <th className="py-3 px-2">Ordered Items</th>
                      <th className="py-3 px-2">Shipping Details</th>
                      <th className="py-3 px-2">Date</th>
                      <th className="py-3 px-2">Total Amount</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersList.map((o) => (
                      <tr key={o.id} className="border-b border-slate-100 dark:border-neutral-800/40 hover:bg-slate-50/40 dark:hover:bg-[#121f12]/10 transition-colors">
                        <td className="py-3 px-2 font-bold text-slate-800 dark:text-slate-200">{o.orderNumber}</td>
                        <td className="py-3 px-2 text-slate-600 dark:text-slate-400">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{o.user.name}</span>
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-[9px] font-bold text-slate-500">
                            {o.user.gender || 'N/A'}
                          </span>
                          <br/>
                          <span className="text-[10px] text-slate-400">{o.user.email}</span>
                          <br/>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{o.user.phoneNumber}</span>
                        </td>
                        <td className="py-3 px-2 text-slate-600 dark:text-slate-400">
                          {o.orderItems && o.orderItems.length > 0 ? (
                            o.orderItems.map((item) => (
                              <div key={item.id} className="mb-1 last:mb-0 leading-tight">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.product?.name || 'Unknown Product'}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">x{item.quantity}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-400">No Items</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-slate-600 dark:text-slate-400 max-w-[280px]">
                          <p className="font-medium text-slate-700 dark:text-slate-300 leading-tight">{o.shippingAddress}</p>
                          <div className="text-[9px] text-slate-400 mt-1 flex flex-wrap gap-x-2">
                            <span><strong>Village:</strong> {o.user.village || 'N/A'}</span>
                            <span><strong>City:</strong> {o.user.city || 'N/A'}</span>
                            <span><strong>District:</strong> {o.user.district || 'N/A'}</span>
                            <span><strong>State:</strong> {o.user.state || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-slate-500">{o.createdAt.substring(0, 10)}</td>
                        <td className="py-3 px-2 font-bold text-brand">₹{o.totalAmount}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            o.status === 'Finished' || o.status === 'Delivered'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : o.status === 'Cancel'
                                ? 'bg-rose-500/10 text-rose-500'
                                : 'bg-brand/10 text-brand'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={o.status}
                              onChange={(e) => handleOrderStatusUpdate(o.id, e.target.value)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white dark:bg-neutral-800 dark:border-neutral-700 text-[10px] font-bold text-slate-800 dark:text-slate-200 outline-none"
                            >
                              <option value="Ordered">Ordered</option>
                              <option value="Shipping">Shipping</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Finished">Finished</option>
                              <option value="Cancel">Cancel</option>
                            </select>
                            <button
                              onClick={() => handleDeleteOrder(o.id)}
                              className="p-1.5 rounded-lg border border-rose-200 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[10px] font-bold transition-all"
                              title="Delete Order"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {/* D. USERS MANAGEMENTS */}
          {activeTab === 'users' && (
            <GlassCard className="p-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-1.5">
                <Users size={18} className="text-brand" /> Manage Customer Accounts
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-neutral-800 text-slate-400">
                      <th className="py-3 px-2">Name</th>
                      <th className="py-3 px-2">Email</th>
                      <th className="py-3 px-2">Phone</th>
                      <th className="py-3 px-2">Gender</th>
                      <th className="py-3 px-2">Role</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.id} className="border-b border-slate-100 dark:border-neutral-800/40">
                        <td className="py-3 px-2 font-bold text-slate-800 dark:text-slate-200">{u.name}</td>
                        <td className="py-3 px-2 text-slate-500">{u.email}</td>
                        <td className="py-3 px-2 text-slate-500">{u.phoneNumber}</td>
                        <td className="py-3 px-2 text-slate-500">{u.gender || 'N/A'}</td>
                        <td className="py-3 px-2 text-slate-500">{u.role}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {u.active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => handleToggleUserActive(u.id)}
                            disabled={u.role === 'ADMIN'}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[10px] font-bold disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            {u.active ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={u.role === 'ADMIN'}
                            className="ml-2 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[10px] font-bold disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {/* E. COUPONS RULES */}
          {activeTab === 'coupons' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <GlassCard className="p-5">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4">Create Coupon Code</h3>
                  <form onSubmit={handleCouponSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Coupon Code</label>
                      <input
                        type="text"
                        required
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                        placeholder="e.g. FESTIVE20"
                        className="w-full px-3 py-2 rounded-xl outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Discount Percentage</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        required
                        value={couponForm.discountPercentage}
                        onChange={(e) => setCouponForm({ ...couponForm, discountPercentage: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Expiry Date</label>
                      <input
                        type="date"
                        value={couponForm.expiryDate}
                        onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl font-bold text-xs text-white bg-brand hover:bg-brand-dark transition-all"
                    >
                      Save Coupon
                    </button>
                  </form>
                </GlassCard>
              </div>

              <div className="md:col-span-2">
                <GlassCard className="p-5">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-6">Active Coupons</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-neutral-800 text-slate-400">
                          <th className="py-2 px-2">Code</th>
                          <th className="py-2 px-2">Discount %</th>
                          <th className="py-2 px-2">Expiry</th>
                          <th className="py-2 px-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {couponsList.map((c) => (
                          <tr key={c.id} className="border-b border-slate-100 dark:border-neutral-800/40">
                            <td className="py-2.5 px-2 font-bold text-slate-800 dark:text-slate-200">{c.code}</td>
                            <td className="py-2.5 px-2 font-bold text-brand">{c.discountPercentage}%</td>
                            <td className="py-2.5 px-2 text-slate-400">{c.expiryDate.substring(0, 10)}</td>
                            <td className="py-2.5 px-2 text-right">
                              <button
                                onClick={() => handleDeleteCoupon(c.id)}
                                className="p-1.5 rounded bg-slate-100 dark:bg-neutral-800 text-slate-400 hover:text-rose-500 transition-colors"
                              >
                                <Trash size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {/* F. BULK EMAIL NOTIFICATION BROADCAST */}
          {activeTab === 'mail' && (
            <GlassCard className="p-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5">
                <Mail size={18} className="text-brand" /> Broadcast Bulk Email to Customers
              </h3>
              <p className="text-xs text-slate-400 mb-6">Send newsletter notifications, holiday greetings, or promotional campaign alerts to all active customer base in the database.</p>

              {emailSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs rounded-2xl mb-6 font-semibold">
                  {emailSuccess}
                </div>
              )}

              <form onSubmit={handleSendBulkEmail} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="e.g. Festival Season Offers - Flat 20% Off"
                    className="w-full px-4 py-3 rounded-2xl outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Message Body (HTML support)</label>
                  <textarea
                    required
                    rows={8}
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Write your email body here..."
                    className="w-full px-4 py-3 rounded-2xl outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl font-bold text-xs text-white bg-brand hover:bg-brand-dark transition-all"
                >
                  Send Newsletter Broadcast
                </button>
              </form>
            </GlassCard>
          )}

          {/* G. CONTACT MESSAGES */}
          {activeTab === 'contacts' && (
            <GlassCard className="p-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-1.5">
                <MessageSquare size={18} className="text-brand" /> User Contact Request Inbox
              </h3>

              <div className="space-y-4">
                {contactsList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6">Inbox is empty. No contact messages recorded.</p>
                ) : (
                  contactsList.map((c) => (
                    <div key={c.id} className="p-5 rounded-2xl border border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-[#121f12]/10 text-xs">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200">{c.name}</h4>
                          <span className="text-[10px] text-slate-400">{c.email}</span>
                        </div>
                        <span className="text-[9px] text-slate-400">{c.createdAt.substring(0, 10)}</span>
                      </div>
                      <p className="font-bold text-slate-700 dark:text-slate-300 mt-2">Subject: {c.subject}</p>
                      <p className="text-slate-500 mt-1 leading-relaxed">{c.message}</p>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          )}

        </div>

      </div>

      {/* Product Creation / Update Dialog Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/45 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200/40 dark:border-emerald-950/30 glass-panel p-8 relative animate-slide-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">
              {modalMode === 'CREATE' ? 'Add Product to Catalog' : 'Edit Catalog Product details'}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Product Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand font-bold"
                  >
                    <option value="Organic Masalas">Organic Masalas</option>
                    <option value="Health Mixes">Health Mixes</option>
                    <option value="Traditional Snacks">Traditional Snacks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Description</label>
                <textarea
                  rows={3}
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Original Price</label>
                  <input
                    type="number"
                    required
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Offer Price</label>
                  <input
                    type="number"
                    required
                    value={productForm.offerPrice}
                    onChange={(e) => setProductForm({ ...productForm, offerPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Pack Price (Single)</label>
                  <input
                    type="number"
                    required
                    value={productForm.singlePackPrice}
                    onChange={(e) => setProductForm({ ...productForm, singlePackPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Total Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.totalQuantity}
                    onChange={(e) => setProductForm({ ...productForm, totalQuantity: Number(e.target.value), availableQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Available Quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.availableQuantity}
                    onChange={(e) => setProductForm({ ...productForm, availableQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Product Image URL</label>
                <input
                  type="text"
                  required
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl font-bold text-xs text-white bg-brand hover:bg-brand-dark active:scale-95 transition-all"
              >
                {modalMode === 'CREATE' ? 'Add to Catalog' : 'Save Details'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
