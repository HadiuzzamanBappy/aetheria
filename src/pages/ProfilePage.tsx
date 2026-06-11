import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { Button } from '@/components/ui';
import {
  ShieldCheck,
  Mail,
  User,
  ShieldAlert,
  Package,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  MapPin,
} from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';
import { formatCurrency } from '@/utils/format';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isSignedIn, isLoaded } = useUser();
  const orders = useOrderStore((state) => state.orders);
  
  // Collapsible tracking state
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getDeliveryStatus = (timestamp: string) => {
    const orderTime = new Date(timestamp).getTime();
    const now = new Date().getTime();
    const diffMin = (now - orderTime) / (1000 * 60);

    if (diffMin < 1) {
      return {
        label: 'Processing',
        step: 1,
        color: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
      };
    } else if (diffMin < 3) {
      return {
        label: 'Shipped / In Transit',
        step: 2,
        color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      };
    } else {
      return {
        label: 'Delivered',
        step: 3,
        color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      };
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6 glass p-8 rounded-3xl border border-red-500/15">
        <div className="h-12 w-12 bg-red-500/15 text-red-400 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-white">Unauthorized Access</h3>
          <p className="text-gray-400 text-sm">
            Please log in to access this page.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/')}>
          Return to Catalog
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 text-left">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">User Account</h1>
        <p className="text-xs text-gray-500 mt-1">Manage details and track order delivery histories</p>
      </div>

      {/* Account Details Card */}
      <div className="glass p-8 rounded-3xl border border-purple-900/15 flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Profile Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={user.imageUrl || 'https://robohash.org/placeholder'}
            alt={user.username || 'user'}
            className="h-24 w-24 rounded-2xl border border-purple-500/30 bg-purple-950/40 object-cover shadow-lg animate-float"
          />
          <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-[#07070a] shadow">
            <ShieldCheck className="h-4 w-4" />
          </span>
        </div>

        {/* Info list */}
        <div className="flex-1 space-y-6 w-full">
          <div>
            <h2 className="text-xl font-bold text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-xs text-purple-300/60 font-semibold tracking-wider uppercase mt-1">
              Active Member Profile
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-purple-900/15 pt-6 text-sm">
            <div className="flex items-center gap-3 text-gray-400">
              <User className="h-4 w-4 text-purple-400" />
              <div>
                <span className="text-[10px] text-gray-500 uppercase block font-semibold">Username</span>
                <span className="text-white font-medium">@{user.username || user.primaryEmailAddress?.emailAddress.split('@')[0]}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-400">
              <Mail className="h-4 w-4 text-purple-400" />
              <div>
                <span className="text-[10px] text-gray-500 uppercase block font-semibold">Email Address</span>
                <span className="text-white font-medium">{user.primaryEmailAddress?.emailAddress}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-400">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              <div>
                <span className="text-[10px] text-gray-500 uppercase block font-semibold">Account ID</span>
                <span className="text-white font-semibold font-mono">{user.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order History Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Package className="h-6 w-6 text-primary-400" /> Order History & Status Tracker
        </h2>

        {orders.length === 0 ? (
          <div className="glass p-12 text-center rounded-3xl border border-purple-900/15 space-y-4">
            <Package className="h-10 w-10 text-gray-500 mx-auto" />
            <p className="text-white font-semibold text-base">No orders placed yet</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Any mock orders placed using the checkout simulator will appear here with active status tracking timelines.
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate('/')} className="rounded-xl px-4 mt-2">
              Browse Catalog
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getDeliveryStatus(order.timestamp);
              const isExpanded = expandedOrder === order.orderId;

              return (
                <div
                  key={order.orderId}
                  className="glass border border-purple-900/15 rounded-2xl overflow-hidden hover:border-primary-500/20 transition-colors"
                >
                  {/* Order Summary Summary Header */}
                  <div
                    onClick={() => toggleExpandOrder(order.orderId)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/2 transition-colors select-none"
                  >
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                      <div>
                        <span className="text-gray-500 uppercase block text-[9px] font-semibold">Order ID</span>
                        <span className="font-mono text-white font-bold">{order.orderId}</span>
                      </div>
                      <div className="border-l border-purple-900/10 pl-5">
                        <span className="text-gray-500 uppercase block text-[9px] font-semibold">Placed Date</span>
                        <span className="text-gray-300 font-medium flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          {new Date(order.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="border-l border-purple-900/10 pl-5">
                        <span className="text-gray-500 uppercase block text-[9px] font-semibold">Total Amount</span>
                        <span className="text-primary-400 font-extrabold">{formatCurrency(order.details.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Collapsible Order details */}
                  {isExpanded && (
                    <div className="p-6 border-t border-purple-900/10 bg-purple-950/5 space-y-6 text-xs text-left">
                      {/* Interactive Shipping Status Timeline */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-500" /> Delivery Progress Timeline
                        </h4>
                        
                        <div className="grid grid-cols-4 gap-2 pt-2 relative max-w-xl mx-auto">
                          {/* Continuous line */}
                          <div className="absolute top-2 left-0 right-0 h-1 bg-purple-950/40 rounded -z-10" />
                          <div
                            className="absolute top-2 left-0 h-1 bg-primary-500 rounded -z-10 transition-all duration-500"
                            style={{
                              width:
                                statusInfo.step === 1
                                  ? '33%'
                                  : statusInfo.step === 2
                                  ? '66%'
                                  : '100%',
                            }}
                          />

                          {/* Steps dots & text */}
                          {[
                            { label: 'Placed', active: true },
                            { label: 'Processing', active: statusInfo.step >= 1 },
                            { label: 'In Transit', active: statusInfo.step >= 2 },
                            { label: 'Delivered', active: statusInfo.step >= 3 },
                          ].map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center space-y-1">
                              <div
                                className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                                  step.active
                                    ? 'bg-primary-600 border-primary-500 text-white font-bold text-[9px] shadow-lg shadow-primary-500/20'
                                    : 'bg-purple-950 border-purple-900/30'
                                }`}
                              >
                                {step.active && '✓'}
                              </div>
                              <span
                                className={`text-[10px] font-semibold tracking-tight ${
                                  step.active ? 'text-white' : 'text-gray-500'
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Items & Shipping Address Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-purple-900/10">
                        {/* Purchased Products */}
                        <div className="md:col-span-2 space-y-3">
                          <h4 className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                            Purchased Products
                          </h4>
                          <div className="divide-y divide-purple-900/5 max-h-48 overflow-y-auto pr-1">
                            {order.details.items.map((item) => (
                              <div key={item.id} className="py-2.5 flex items-center gap-3">
                                <img
                                  src={item.thumbnail}
                                  alt={item.title}
                                  className="h-10 w-10 object-contain rounded bg-purple-950/20 border border-purple-900/10"
                                />
                                <div className="flex-1 min-w-0">
                                  <span className="text-white font-bold block truncate">{item.title}</span>
                                  <span className="text-[10px] text-slate-500">
                                    {formatCurrency(item.price)} x {item.quantity}
                                  </span>
                                </div>
                                <span className="font-bold text-white text-right">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Destination */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-500" /> Shipping Destination
                          </h4>
                          <div className="bg-purple-950/20 border border-purple-900/10 rounded-xl p-3.5 space-y-1 text-gray-400 font-light leading-normal">
                            <strong className="text-white font-semibold block mb-1">
                              {order.details.shippingAddress.fullName}
                            </strong>
                            <p>{order.details.shippingAddress.addressLine1}</p>
                            <p>
                              {order.details.shippingAddress.city}, {order.details.shippingAddress.postalCode}
                            </p>
                            <p>{order.details.shippingAddress.country}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
