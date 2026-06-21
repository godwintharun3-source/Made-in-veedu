import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle2, Award, Calendar, FileText, ArrowLeft, RefreshCw } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import axios from 'axios';

export default function TrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('miv_access_token')}` }
        });
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to fetch order details. Please verify access rights.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  const stages = [
    { name: 'Ordered', icon: Package, desc: 'Your organic package is placed and verified.' },
    { name: 'Shipping', icon: Truck, desc: 'Package is handed over to the courier partner.' },
    { name: 'Delivered', icon: CheckCircle2, desc: 'Items delivered to your doorstep.' },
    { name: 'Finished', icon: Award, desc: 'Order cycle complete. Hope you enjoyed it!' }
  ];

  const getStageIndex = (status) => {
    if (status === 'Ordered') return 0;
    if (status === 'Shipping') return 1;
    if (status === 'Delivered') return 2;
    if (status === 'Finished') return 3;
    return -1; // Cancelled
  };

  const currentStageIndex = order ? getStageIndex(order.status) : -1;

  const handleDownloadInvoice = () => {
    // Open in a new tab to let user print or save as PDF
    window.open(`${import.meta.env.VITE_API_URL}/api/orders/${id}/invoice`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-400 text-sm">Loading order timeline...</p>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-rose-500 font-bold mb-4">{errorMsg || 'Order details not found.'}</p>
        <button onClick={() => navigate('/')} className="text-brand text-xs font-bold flex items-center gap-1.5 justify-center mx-auto">
          <ArrowLeft size={16} /> Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      
      {/* Header buttons */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand transition-colors"
        >
          <ArrowLeft size={16} /> Go to Store
        </button>
        <button
          onClick={handleDownloadInvoice}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-emerald-900/30 hover:bg-slate-100 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-300 transition-all"
        >
          <FileText size={14} /> View Invoice
        </button>
      </div>

      <GlassCard className="p-6 mb-8" hover={false}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 dark:border-neutral-800 pb-6 mb-6 text-xs text-slate-500">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Order Number:</span>
            <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mt-0.5">{order.orderNumber}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Date Placed:</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{order.createdAt.substring(0, 10)}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Payment:</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{order.paymentMethod}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Amount Charged:</span>
            <p className="font-extrabold text-brand dark:text-brand-light text-sm mt-0.5">₹{order.totalAmount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-6 border-t border-slate-100 dark:border-neutral-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Shipping Destination:</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{order.shippingAddress}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Items Ordered:</span>
            <div className="mt-1 space-y-1.5">
              {order.orderItems?.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.product?.name || 'Unknown Product'}</span>
                    <span className="ml-1 text-slate-400 dark:text-slate-500">x{item.quantity}</span>
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Timeline UI */}
      <GlassCard className="p-8 relative" hover={false}>
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-2">
          <Truck size={18} className="text-brand" /> Delivery Timeline
        </h3>

        {order.status === 'Cancel' ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-center text-xs font-semibold">
            ❌ This order has been cancelled. All product stocks have been returned to inventory.
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-0 flex flex-col sm:flex-row justify-between items-start gap-8 sm:gap-4">
            
            {/* Horizontal connection line for desktop */}
            <div className="absolute top-[26px] left-[10%] right-[10%] h-[3px] bg-slate-200 dark:bg-emerald-950/20 hidden sm:block z-0" />
            {/* Active connection line overlay */}
            {currentStageIndex > 0 && (
              <div
                className="absolute top-[26px] left-[10%] h-[3px] bg-brand dark:bg-brand-light hidden sm:block z-0 transition-all duration-500"
                style={{ width: `${(currentStageIndex / 3) * 80}%` }}
              />
            )}

            {/* Vertical connection line for mobile */}
            <div className="absolute left-[33px] top-[26px] bottom-[26px] w-[3px] bg-slate-200 dark:bg-emerald-950/20 sm:hidden z-0" />
            {currentStageIndex > 0 && (
              <div
                className="absolute left-[33px] top-[26px] w-[3px] bg-brand dark:bg-brand-light sm:hidden z-0 transition-all duration-500"
                style={{ height: `${(currentStageIndex / 3) * 90}%` }}
              />
            )}

            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              const isCompleted = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div key={idx} className="flex sm:flex-col items-center sm:text-center w-full sm:w-1/4 relative z-10 gap-4 sm:gap-2">
                  
                  {/* Icon Node */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-brand dark:bg-brand-dark text-white border-brand scale-110 shadow-lg shadow-brand/20'
                        : 'bg-white dark:bg-neutral-900 text-slate-400 border-slate-200 dark:border-neutral-800'
                    } ${isCurrent ? 'ring-4 ring-brand/20 dark:ring-brand/40 animate-pulse' : ''}`}
                  >
                    <Icon size={18} />
                  </div>

                  {/* Content details */}
                  <div className="text-left sm:text-center">
                    <h4 className={`font-bold text-xs ${isCompleted ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                      {stage.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[150px] mx-auto leading-relaxed">
                      {stage.desc}
                    </p>
                  </div>

                </div>
              );
            })}

          </div>
        )}
      </GlassCard>

    </div>
  );
}
