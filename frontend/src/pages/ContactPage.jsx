import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Sparkles, Check, Info } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import axios from 'axios';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/contact`, formData);
      setSuccess('Your contact request has been sent! We will get back to you shortly.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
      setError('Failed to send contact request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] px-6 py-12 overflow-hidden">
      
      {/* Glow Spots */}
      <div className="blur-spot blur-emerald top-10 left-10" />
      <div className="blur-spot blur-brand bottom-10 right-10" />

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        
        {/* Info panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-400 text-xs font-semibold">
            <Sparkles size={12} /> Contact Us
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Get In Touch</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Have questions about our traditional recipes, organic mixes, bulk ordering, or delivery timelines? 
            Drop us a message or reach out through our channels!
          </p>

          <div className="space-y-4 pt-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                <Phone size={14} />
              </div>
              <div>
                <p className="font-bold text-slate-400">Phone</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">+91 9443724005</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                <Mail size={14} />
              </div>
              <div>
                <p className="font-bold text-slate-400">Email</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">desienterprises1011@gmail.com</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                <MapPin size={14} />
              </div>
              <div>
                <p className="font-bold text-slate-400">Address</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">Veedu Village, Madurai, Tamil Nadu</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="md:col-span-2">
          <GlassCard className="p-8">
            {success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl mb-6 flex items-center gap-2 text-xs font-semibold">
                <Check size={16} /> {success}
              </div>
            )}
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl mb-6 flex items-center gap-2 text-xs font-semibold">
                <Info size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className="w-full px-4 py-3 rounded-2xl outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@email.com"
                    className="w-full px-4 py-3 rounded-2xl outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
                <input
                  type="text"
                  required
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 rounded-2xl outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Message</label>
                <textarea
                  required
                  rows={5}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write details of your query..."
                  className="w-full px-4 py-3 rounded-2xl outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl font-bold text-xs text-white bg-brand hover:bg-brand-dark active:scale-95 transition-all shadow-md shadow-brand/20 disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {loading ? 'Sending Message...' : 'Send Message'}
                </button>
              </div>

            </form>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
