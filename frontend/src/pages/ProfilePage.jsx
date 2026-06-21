import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, ShoppingBag, Lock, Heart, Edit2, ShieldCheck, Check, Eye, EyeOff } from 'lucide-react';
import { updateUserProfile } from '../store/authSlice';
import GlassCard from '../components/GlassCard';
import axios from 'axios';

export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { wishlist } = useSelector((state) => state.products);

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders'); // orders, profile, password, wishlist
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Profile Form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    state: user?.state || '',
    district: user?.district || '',
    city: user?.city || '',
    village: user?.village || '',
    addressLine: user?.addressLine || '',
    pincode: user?.pincode || '',
    altPhoneNumber: user?.altPhoneNumber || '',
    altState: user?.altState || '',
    altDistrict: user?.altDistrict || '',
    altCity: user?.altCity || '',
    altVillage: user?.altVillage || '',
    altAddressLine: user?.altAddressLine || '',
    altPincode: user?.altPincode || '',
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  const evaluatePasswordStrength = (pass) => {
    let strength = 'Weak';
    const hasLength = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[@#$%^&+=!_]/.test(pass);

    const matchCount = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (matchCount === 5) {
      strength = 'Strong';
    } else if (matchCount >= 3) {
      strength = 'Medium';
    } else if (pass.length > 0) {
      strength = 'Weak';
    } else {
      strength = '';
    }
    setPasswordStrength(strength);
  };

  // Password Form state
  const [passData, setPassData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/orders', {
          headers: { Authorization: `Bearer ${localStorage.getItem('miv_access_token')}` }
        });
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', msg: '' });

    try {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(profileData.name)) {
        setFeedback({ type: 'error', msg: 'Name must contain only alphabets and spaces.' });
        return;
      }
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(profileData.phoneNumber)) {
        setFeedback({ type: 'error', msg: 'Invalid phone number format.' });
        return;
      }
      if (profileData.altPhoneNumber && !phoneRegex.test(profileData.altPhoneNumber)) {
        setFeedback({ type: 'error', msg: 'Invalid alternate phone number format.' });
        return;
      }
      const pincodeRegex = /^[1-9][0-9]{5}$/;
      if (!pincodeRegex.test(profileData.pincode)) {
        setFeedback({ type: 'error', msg: 'Pincode must be 6 digits.' });
        return;
      }
      if (profileData.altPincode && !pincodeRegex.test(profileData.altPincode)) {
        setFeedback({ type: 'error', msg: 'Alternate Pincode must be 6 digits.' });
        return;
      }
      // Typically we would put an endpoint in user controller, let's mock the update or save details
      // Dispatches store action to update redux state
      dispatch(updateUserProfile(profileData));
      setFeedback({ type: 'success', msg: 'Profile details updated successfully.' });
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Failed to update profile details.' });
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', msg: '' });

    if (passData.newPassword !== passData.confirmPassword) {
      setFeedback({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }

    const passRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!_]).{8,}$/;
    if (!passRegex.test(passData.newPassword)) {
      setFeedback({ type: 'error', msg: 'Password must be at least 8 characters long and contain 1 uppercase, 1 lowercase, 1 number, and 1 special character.' });
      return;
    }

    try {
      await axios.put('http://localhost:8080/api/auth/change-password', {
        oldPassword: passData.oldPassword,
        newPassword: passData.newPassword
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('miv_access_token')}` }
      });
      setFeedback({ type: 'success', msg: 'Password updated successfully!' });
      setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setFeedback({ type: 'error', msg: err.response?.data?.message || 'Password update failed. Verify current password.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-8">
        Customer Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Tabs */}
        <div className="md:col-span-1 space-y-2">
          <button
            onClick={() => { setActiveTab('orders'); setFeedback({ type: '', msg: '' }); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-brand text-white shadow-md'
                : 'bg-white/40 dark:bg-emerald-950/10 border border-slate-200/40 dark:border-emerald-950/20 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag size={16} /> My Orders
          </button>
          
          <button
            onClick={() => { setActiveTab('profile'); setFeedback({ type: '', msg: '' }); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-brand text-white shadow-md'
                : 'bg-white/40 dark:bg-emerald-950/10 border border-slate-200/40 dark:border-emerald-950/20 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <User size={16} /> Edit Profile
          </button>

          <button
            onClick={() => { setActiveTab('password'); setFeedback({ type: '', msg: '' }); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'password'
                ? 'bg-brand text-white shadow-md'
                : 'bg-white/40 dark:bg-emerald-950/10 border border-slate-200/40 dark:border-emerald-950/20 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Lock size={16} /> Security Settings
          </button>

          <button
            onClick={() => { setActiveTab('wishlist'); setFeedback({ type: '', msg: '' }); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'wishlist'
                ? 'bg-brand text-white shadow-md'
                : 'bg-white/40 dark:bg-emerald-950/10 border border-slate-200/40 dark:border-emerald-950/20 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Heart size={16} /> My Wishlist ({wishlist.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="md:col-span-3">
          
          {feedback.msg && (
            <div className={`p-4 rounded-2xl mb-6 flex items-center gap-2 text-xs font-semibold ${
              feedback.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600' : 'bg-rose-500/10 border border-rose-500/20 text-rose-500'
            }`}>
              <Check size={16} /> {feedback.msg}
            </div>
          )}

          {/* 1. ORDERS LIST */}
          {activeTab === 'orders' && (
            <GlassCard className="p-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <ShoppingBag size={18} className="text-brand" /> Order Purchase History
              </h3>

              {ordersLoading ? (
                <p className="text-xs text-slate-400">Loading your transactions...</p>
              ) : orders.length === 0 ? (
                <p className="text-xs text-slate-400 py-6">You have not placed any orders yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="p-4 rounded-2xl border border-slate-100 dark:border-neutral-800/40 bg-slate-50/50 dark:bg-[#121f12]/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{o.orderNumber}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Placed: {o.createdAt.substring(0, 10)} • Payment: {o.paymentMethod}</p>
                        
                        {/* Ordered Items List */}
                        <div className="mt-2.5 space-y-1 pl-1 border-l-2 border-brand/20">
                          {o.orderItems?.map((item) => (
                            <p key={item.id} className="text-[11px] text-slate-600 dark:text-slate-400">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{item.product?.name || 'Unknown Product'}</span>
                              <span className="text-slate-400 dark:text-slate-500 ml-1">x{item.quantity}</span>
                              <span className="text-slate-500 dark:text-slate-400 ml-2 font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </p>
                          ))}
                        </div>
                        <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mt-2.5">
                          Order Total: <span className="text-brand dark:text-brand-light">₹{o.totalAmount}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            o.status === 'Finished' || o.status === 'Delivered'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : o.status === 'Cancel'
                                ? 'bg-rose-500/10 text-rose-500'
                                : 'bg-brand/10 text-brand'
                          }`}>
                            {o.status}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate(`/tracking/${o.id}`)}
                          className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold text-[10px] transition-colors"
                        >
                          Track
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          )}

          {/* 2. PROFILE EDIT */}
          {activeTab === 'profile' && (
            <GlassCard className="p-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Edit2 size={18} className="text-brand" /> Edit Shipping &amp; Contact Details
              </h3>

              <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Address Line</label>
                    <input
                      type="text"
                      required
                      value={profileData.addressLine}
                      onChange={(e) => setProfileData({ ...profileData, addressLine: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Village / Suburb</label>
                    <input
                      type="text"
                      value={profileData.village}
                      onChange={(e) => setProfileData({ ...profileData, village: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">City</label>
                    <input
                      type="text"
                      required
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">District</label>
                    <input
                      type="text"
                      required
                      value={profileData.district}
                      onChange={(e) => setProfileData({ ...profileData, district: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">State</label>
                    <input
                      type="text"
                      required
                      value={profileData.state}
                      onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pincode</label>
                    <input
                      type="text"
                      required
                      value={profileData.pincode}
                      onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-neutral-800">
                  <h3 className="font-bold text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-widest pb-2">
                    Alternative Contact (Optional)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Alternate Phone</label>
                    <input
                      type="text"
                      value={profileData.altPhoneNumber}
                      onChange={(e) => setProfileData({ ...profileData, altPhoneNumber: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Alternate Address</label>
                    <input
                      type="text"
                      value={profileData.altAddressLine}
                      onChange={(e) => setProfileData({ ...profileData, altAddressLine: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Alt City</label>
                    <input
                      type="text"
                      value={profileData.altCity}
                      onChange={(e) => setProfileData({ ...profileData, altCity: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Alt District</label>
                    <input
                      type="text"
                      value={profileData.altDistrict}
                      onChange={(e) => setProfileData({ ...profileData, altDistrict: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Alt State</label>
                    <input
                      type="text"
                      value={profileData.altState}
                      onChange={(e) => setProfileData({ ...profileData, altState: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Alt Pincode</label>
                    <input
                      type="text"
                      value={profileData.altPincode}
                      onChange={(e) => setProfileData({ ...profileData, altPincode: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl font-bold text-xs text-white bg-brand hover:bg-brand-dark transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </GlassCard>
          )}

          {/* 3. PASSWORD CHANGE */}
          {activeTab === 'password' && (
            <GlassCard className="p-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Lock size={18} className="text-brand" /> Change Account Password
              </h3>

              <form onSubmit={handlePasswordUpdate} className="space-y-4 text-xs max-w-md">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      required
                      value={passData.oldPassword}
                      onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })}
                      className="w-full px-4 pr-11 py-3 rounded-2xl bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={passData.newPassword}
                      onChange={(e) => {
                        setPassData({ ...passData, newPassword: e.target.value });
                        evaluatePasswordStrength(e.target.value);
                      }}
                      className="w-full px-4 pr-11 py-3 rounded-2xl bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordStrength && (
                    <div className="mt-2 text-[10px] font-bold flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className={`h-full transition-all ${
                          passwordStrength === 'Strong' ? 'w-full bg-emerald-500' : 
                          passwordStrength === 'Medium' ? 'w-2/3 bg-yellow-500' : 'w-1/3 bg-rose-500'
                        }`} />
                      </div>
                      <span className={
                        passwordStrength === 'Strong' ? 'text-emerald-600' : 
                        passwordStrength === 'Medium' ? 'text-yellow-600' : 'text-rose-500'
                      }>{passwordStrength}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={passData.confirmPassword}
                      onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                      className="w-full px-4 pr-11 py-3 rounded-2xl bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-brand"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl font-bold text-xs text-white bg-brand hover:bg-brand-dark transition-all"
                >
                  Update Password
                </button>
              </form>
            </GlassCard>
          )}

          {/* 4. WISHLIST */}
          {activeTab === 'wishlist' && (
            <GlassCard className="p-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Heart size={18} className="text-brand" /> Saved Products ({wishlist.length})
              </h3>

              {wishlist.length === 0 ? (
                <p className="text-xs text-slate-400 py-6">You have not saved any items yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {wishlist.map((p) => (
                    <GlassCard key={p.id} className="p-4 flex flex-col items-center text-center relative" hover={true}>
                      <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded-xl mb-3 shadow-md" />
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">{p.name}</h4>
                      <span className="text-sm font-extrabold text-brand mt-1">₹{p.offerPrice}</span>
                      <button
                        onClick={() => navigate(`/product/${p.id}`)}
                        className="mt-3 w-full py-1.5 rounded-xl text-[10px] font-bold text-white bg-brand hover:bg-brand-dark transition-all"
                      >
                        View Product
                      </button>
                    </GlassCard>
                  ))}
                </div>
              )}
            </GlassCard>
          )}

        </div>

      </div>
    </div>
  );
}
