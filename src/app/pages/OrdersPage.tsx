import { useEffect, useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { ChevronRight, Package, Calendar, MapPin, Download } from 'lucide-react';
import type { Order } from '../types';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    fetchOrders();
  }, [isAuthenticated, token]);

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/users/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#111', marginBottom: '8px' }}>
            My Orders
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.9375rem' }}>
            Track and manage all your orders in one place
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
            <div style={{ animation: 'spin 1s linear infinite', display: 'inline-block', width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: '#2563eb' }} />
            <p style={{ marginTop: '16px' }}>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
            <Package size={48} style={{ margin: '0 auto', color: '#d1d5db', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111', marginBottom: '8px' }}>No orders yet</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Start shopping to see your orders here</p>
            <a
              href="/products"
              style={{
                display: 'inline-block',
                padding: '12px 28px',
                backgroundColor: '#2563eb',
                color: '#fff',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.opacity = '1'}
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                  (e.currentTarget as HTMLElement).style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: expandedOrder === order.id ? '20px' : '0' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                          Order ID
                        </div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111' }}>
                          {order.order_number || order.id}
                        </div>
                      </div>
                      <div style={{ width: '1px', height: '32px', backgroundColor: '#e5e7eb' }} />
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                          Status
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(order.status) }} />
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: getStatusColor(order.status) }}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                      </div>
                      <div style={{ width: '1px', height: '32px', backgroundColor: '#e5e7eb' }} />
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                          Total
                        </div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111' }}>
                          KES {order.total?.toLocaleString() || '0'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    style={{
                      color: '#9ca3af',
                      transition: 'transform 0.2s',
                      transform: expandedOrder === order.id ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}
                  />
                </div>

                {/* Expanded Details */}
                {expandedOrder === order.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginTop: '20px' }}
                  >
                    {/* Date & Address */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                          <Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                          Order Date
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#111' }}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                          <MapPin size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                          Shipping Address
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#111' }}>
                          {order.shipping_address?.street || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', marginBottom: '12px' }}>Items</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {order.items?.map((item: any, i: number) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < (order.items?.length || 0) - 1 ? '1px solid #f3f4f6' : 'none' }}>
                            <div>
                              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111' }}>
                                {item.product_name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                                Qty: {item.quantity} × KES {item.unit_price?.toLocaleString()}
                              </div>
                            </div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111' }}>
                              KES {(item.total_price)?.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px' }}>
                        <span style={{ color: '#6b7280' }}>Subtotal</span>
                        <span style={{ color: '#111', fontWeight: 600 }}>KES {order.subtotal?.toLocaleString()}</span>
                      </div>
                      {order.shipping_cost > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px' }}>
                          <span style={{ color: '#6b7280' }}>Shipping</span>
                          <span style={{ color: '#111', fontWeight: 600 }}>KES {order.shipping_cost?.toLocaleString()}</span>
                        </div>
                      )}
                      {order.discount_amount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px' }}>
                          <span style={{ color: '#6b7280' }}>Discount</span>
                          <span style={{ color: '#10b981', fontWeight: 600 }}>-KES {order.discount_amount?.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <a
                        href={`/orders/${order.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          backgroundColor: '#2563eb',
                          color: '#fff',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.opacity = '1'}
                      >
                        <Download size={14} />
                        View Details
                      </a>
                      {order.status?.toLowerCase() === 'pending' && (
                        <button
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = '#fef2f2';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                          }}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
