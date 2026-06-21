import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, Heart, User, Sun, Moon, LogOut, Search, Settings, Menu, X } from 'lucide-react';
import { logout } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';
import { setSearchResults, setCategory } from '../store/productSlice';
import axios from 'axios';


export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.products);
  const { mode } = useSelector((state) => state.theme);

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const totalCartCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      dispatch(setSearchResults([]));
      dispatch(setCategory('All'));
      return;
    }

    try {
      // Hit the FastAPI NLP smart search endpoint
      const res = await axios.post(`${import.meta.env.VITE_AI_URL}/search`, { query: searchQuery });
      dispatch(setSearchResults(res.data.results));
      dispatch(setCategory('Search Results'));
      navigate('/');
    } catch (err) {
      console.error("Smart search failed", err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 px-6 py-4 transition-all duration-300 backdrop-blur-md bg-white/60 dark:bg-[#080d08]/60 border-b border-slate-200/40 dark:border-emerald-950/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform">
          <img src="/logo.png" alt="Made In Veedu Logo" className="w-10 h-10 object-contain rounded-full shadow-md" />
          <span className="font-bold text-lg tracking-wider text-emerald-800 dark:text-emerald-400">
            MADE IN VEEDU
          </span>
        </Link>

        {/* Smart Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center w-full max-w-md relative mx-6">
          <input
            type="text"
            placeholder="Try: 'Show healthy products under ₹250'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-full text-sm outline-none transition-all duration-300 bg-slate-100 dark:bg-emerald-950/20 focus:bg-white focus:ring-2 focus:ring-brand dark:focus:ring-brand-light border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200"
          />
          <button type="submit" className="absolute right-3 text-slate-400 hover:text-brand transition-colors">
            <Search size={18} />
          </button>
        </form>

        {/* Navigation Actions */}
        <div className="flex items-center gap-4">
          
          {/* Navigation Links */}
          <Link to="/" className="text-sm font-semibold hover:text-brand dark:hover:text-brand-light transition-colors hidden sm:block">Home</Link>
          <Link to="/contact" className="text-sm font-semibold hover:text-brand dark:hover:text-brand-light transition-colors hidden sm:block">Contact</Link>

          {/* Theme Toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-emerald-950/30 transition-colors text-slate-600 dark:text-slate-300"
          >
            {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Wishlist Link */}
          <Link
            to="/dashboard?tab=wishlist"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-emerald-950/30 transition-colors text-slate-600 dark:text-slate-300 relative"
          >
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Link */}
          <Link
            to="/cart"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-emerald-950/30 transition-colors text-slate-600 dark:text-slate-300 relative"
          >
            <ShoppingCart size={20} />
            {totalCartCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-brand text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {totalCartCount}
              </span>
            )}
          </Link>

          {/* User Account Controls */}
          <div className="relative">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full border border-slate-200 dark:border-emerald-900/30 hover:bg-slate-100 dark:hover:bg-emerald-950/30 transition-all text-slate-700 dark:text-slate-300"
                >
                  <div className="w-7 h-7 rounded-full bg-brand dark:bg-brand-dark flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 rounded-2xl shadow-xl bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 p-2 text-slate-800 dark:text-slate-200 z-50 glass-panel">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-neutral-800 mb-1">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="font-semibold text-sm truncate">{user?.name}</p>
                    </div>
                    {user?.role === 'ADMIN' ? (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <Settings size={16} /> Admin Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <User size={16} /> My Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 transition-colors text-left"
                    >
                      <LogOut size={16} /> Log Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-brand hover:bg-brand-dark active:scale-95 transition-all shadow-md shadow-brand/20"
              >
                <User size={14} /> Login
              </Link>
            )}
          </div>

          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-emerald-950/30 transition-colors text-slate-600 dark:text-slate-300 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>
      </div>

      {/* Mobile Vertical Menu Drawer */}
      {menuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-200/40 dark:border-emerald-950/20 flex flex-col gap-4 animate-fade-in">
          {/* Mobile Smart Search */}
          <form onSubmit={(e) => { handleSearch(e); setMenuOpen(false); }} className="flex items-center w-full relative">
            <input
              type="text"
              placeholder="Search: e.g. 'masalas under 200'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-full text-xs outline-none bg-slate-100 dark:bg-emerald-950/20 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200"
            />
            <button type="submit" className="absolute right-3 text-slate-400">
              <Search size={16} />
            </button>
          </form>

          {/* Mobile Links list */}
          <div className="flex flex-col gap-2.5 text-xs font-semibold px-2">
            <Link 
              to="/" 
              onClick={() => setMenuOpen(false)}
              className="py-2 hover:text-brand transition-colors border-b border-slate-100/30 dark:border-neutral-800/30"
            >
              Home
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setMenuOpen(false)}
              className="py-2 hover:text-brand transition-colors border-b border-slate-100/30 dark:border-neutral-800/30"
            >
              Contact
            </Link>
            <Link 
              to="/dashboard?tab=wishlist" 
              onClick={() => setMenuOpen(false)}
              className="py-2 flex items-center justify-between hover:text-brand transition-colors border-b border-slate-100/30 dark:border-neutral-800/30"
            >
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link 
              to="/cart" 
              onClick={() => setMenuOpen(false)}
              className="py-2 flex items-center justify-between hover:text-brand transition-colors border-b border-slate-100/30 dark:border-neutral-800/30"
            >
              <span>My Cart</span>
              {totalCartCount > 0 && (
                <span className="px-2 py-0.5 bg-brand text-white rounded-full text-[10px] font-bold">
                  {totalCartCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  onClick={() => setMenuOpen(false)}
                  className="py-2 hover:text-brand transition-colors border-b border-slate-100/30 dark:border-neutral-800/30"
                >
                  {user?.role === 'ADMIN' ? 'Admin Dashboard' : 'My Dashboard'}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="py-2 text-left text-rose-500 hover:text-rose-600 transition-colors font-bold"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="py-2 text-brand font-bold transition-colors"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
