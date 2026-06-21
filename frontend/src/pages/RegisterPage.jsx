import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Sparkles, MapPin, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { setCredentials } from '../store/authSlice';
import { setCartItems } from '../store/cartSlice';
import GlassCard from '../components/GlassCard';
import axios from 'axios';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    state: '',
    district: '',
    city: '',
    village: '',
    addressLine: '',
    pincode: '',
    gender: '',
    altPhoneNumber: '',
    altState: '',
    altDistrict: '',
    altCity: '',
    altVillage: '',
    altAddressLine: '',
    altPincode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      evaluatePasswordStrength(value);
    }
  };

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

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Frontend validations
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(formData.name)) {
      setErrorMsg('Name must contain only alphabets and spaces.');
      return;
    }

    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setErrorMsg('Invalid phone number format.');
      return;
    }

    if (formData.altPhoneNumber && !phoneRegex.test(formData.altPhoneNumber)) {
      setErrorMsg('Invalid alternate phone number format.');
      return;
    }

    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(formData.pincode)) {
      setErrorMsg('Pincode must be 6 digits.');
      return;
    }

    if (formData.altPincode && !pincodeRegex.test(formData.altPincode)) {
      setErrorMsg('Alternate Pincode must be 6 digits.');
      return;
    }

    const passRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!_]).{8,}$/;
    if (!passRegex.test(formData.password)) {
      setErrorMsg('Password must be at least 8 characters long and contain 1 uppercase, 1 lowercase, 1 number, and 1 special character.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8080/api/auth/signup', formData);
      dispatch(setCredentials(res.data));
      
      // Pull offline local cart items
      const localCart = JSON.parse(localStorage.getItem('miv_cart') || '[]');
      if (localCart.length > 0) {
        for (const item of localCart) {
          try {
            await axios.post('http://localhost:8080/api/cart', {
              productId: item.product.id,
              quantity: item.quantity
            }, {
              headers: { Authorization: `Bearer ${res.data.accessToken}` }
            });
          } catch (err) {
            console.error("Error syncing offline cart items", err);
          }
        }
      }

      // Sync and retrieve consolidated cart from backend database
      try {
        const cartRes = await axios.get('http://localhost:8080/api/cart', {
          headers: { Authorization: `Bearer ${res.data.accessToken}` }
        });
        dispatch(setCartItems(cartRes.data));
      } catch (err) {
        console.error("Error syncing cart items after registration", err);
      }

      navigate('/');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-16 overflow-hidden">
      
      {/* Glow Spots */}
      <div className="blur-spot blur-emerald top-10 left-10" />
      <div className="blur-spot blur-teal bottom-10 right-10" />

      <GlassCard className="w-full max-w-2xl p-8 relative z-10" hover={false}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-400 text-xs font-semibold mb-3">
            <Sparkles size={12} /> Account Registration
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Create Your Account</h2>
          <p className="text-xs text-slate-400 mt-1">Get started to order organic spices, tracking delivery stages in real-time.</p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold mb-6">
            <ShieldAlert size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Personal info */}
            <div className="space-y-4">
              <h3 className="font-bold text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-widest border-b border-slate-100 dark:border-neutral-800 pb-2">
                Personal Information
              </h3>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                <div className="relative">
                  <select
                    required
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
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

            </div>

            {/* Right Column: Address details */}
            <div className="space-y-4">
              <h3 className="font-bold text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-widest border-b border-slate-100 dark:border-neutral-800 pb-2">
                Shipping Address Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">State</label>
                  <input
                    type="text"
                    required
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Tamil Nadu"
                    className="w-full px-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">District</label>
                  <input
                    type="text"
                    required
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Madurai"
                    className="w-full px-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">City</label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Madurai"
                    className="w-full px-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Village</label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="e.g. Veedu Village"
                    className="w-full px-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Address Line</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    name="addressLine"
                    value={formData.addressLine}
                    onChange={handleChange}
                    placeholder="Door No, Street Name, Landmark"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pincode</label>
                <input
                  type="text"
                  required
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 625001"
                  className="w-full px-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-neutral-800">
                <h3 className="font-bold text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-widest pb-2">
                  Alternative Contact (Optional)
                </h3>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Alternate Phone</label>
                <input
                  type="text"
                  name="altPhoneNumber"
                  value={formData.altPhoneNumber}
                  onChange={handleChange}
                  placeholder="e.g. 9876543211"
                  className="w-full px-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Alternate Address</label>
                <input
                  type="text"
                  name="altAddressLine"
                  value={formData.altAddressLine}
                  onChange={handleChange}
                  placeholder="Door No, Street Name, Landmark"
                  className="w-full px-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Alt Pincode</label>
                  <input
                    type="text"
                    name="altPincode"
                    value={formData.altPincode}
                    onChange={handleChange}
                    placeholder="625001"
                    className="w-full px-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Alt State</label>
                  <input
                    type="text"
                    name="altState"
                    value={formData.altState}
                    onChange={handleChange}
                    placeholder="Tamil Nadu"
                    className="w-full px-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-xs text-white bg-brand hover:bg-brand-dark active:scale-95 transition-all shadow-md shadow-brand/20 disabled:bg-slate-200 disabled:text-slate-400"
            >
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand hover:text-brand-dark transition-colors">
            Sign In
          </Link>
        </p>

      </GlassCard>
    </div>
  );
}
