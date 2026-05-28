import { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Settings, Mail, Phone, MapPin, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsPage() {
  const { isAuthenticated, user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
  });
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    fetchAddresses();
  }, [isAuthenticated, token]);

  const fetchAddresses = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/users/addresses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const settingsSections = [
    {
      title: 'Account Settings',
      icon: Settings,
      items: [
        { label: 'Profile Information', href: '#profile' },
        { label: 'Change Password', href: '#password' },
        { label: 'Privacy Settings', href: '#privacy' },
      ]
    },
    {
      title: 'Shopping',
      icon: MapPin,
      items: [
        { label: 'Saved Addresses', href: '#addresses', count: addresses.length },
        { label: 'Order History', href: '/orders' },
        { label: 'Wishlist', href: '/wishlist' },
      ]
    },
    {
      title: 'Security',
      icon: Lock,
      items: [
        { label: 'Two-Factor Authentication', href: '#2fa' },
        { label: 'Active Sessions', href: '#sessions' },
        { label: 'Login History', href: '#history' },
      ]
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#111', marginBottom: '8px' }}>
            Settings
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.9375rem' }}>
            Manage your account, privacy, and preferences
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          {/* Left Sidebar - Quick Links */}
          <div>
            {settingsSections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{
                    padding: '16px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <Icon size={20} style={{ color: '#2563eb' }} />
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111' }}>
                      {section.title}
                    </h3>
                  </div>
                  <div style={{ padding: '8px' }}>
                    {section.items.map((item, i) => (
                      <a
                        key={i}
                        href={item.href}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 12px',
                          color: '#374151',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          borderRadius: '8px',
                          transition: 'all 0.2s',
                          marginBottom: i < section.items.length - 1 ? '4px' : '0'
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6';
                          (e.currentTarget as HTMLElement).style.color = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = '#374151';
                        }}
                      >
                        <span>{item.label}</span>
                        {item.count !== undefined && (
                          <span style={{ backgroundColor: '#e5e7eb', color: '#6b7280', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {item.count}
                          </span>
                        )}
                        <ArrowRight size={14} />
                      </a>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Main Content */}
          <div style={{ gridColumn: 'span 2' }}>
            {/* Profile Form */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              id="profile"
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e5e7eb',
                marginBottom: '24px'
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111', marginBottom: '20px' }}>
                Profile Information
              </h2>

              <form onSubmit={handleUpdateProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111', marginBottom: '6px' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => (e.currentTarget as HTMLElement).style.borderColor = '#2563eb'}
                      onBlur={(e) => (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111', marginBottom: '6px' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        backgroundColor: '#f9fafb',
                        color: '#9ca3af',
                        cursor: 'not-allowed'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111', marginBottom: '6px' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+254..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => (e.currentTarget as HTMLElement).style.borderColor = '#2563eb'}
                      onBlur={(e) => (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: loading ? '#d1d5db' : '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </motion.div>

            {/* Saved Addresses */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              id="addresses"
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e5e7eb'
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111', marginBottom: '20px' }}>
                Saved Addresses
              </h2>

              {loadingAddresses ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                  Loading addresses...
                </div>
              ) : addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <p style={{ color: '#6b7280', marginBottom: '16px' }}>No saved addresses yet</p>
                  <a
                    href="/checkout"
                    style={{
                      display: 'inline-block',
                      padding: '10px 24px',
                      backgroundColor: '#2563eb',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    Add Address During Checkout
                  </a>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {addresses.map((addr, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111' }}>
                          {addr.label}
                        </h4>
                        {addr.is_default && (
                          <span style={{ fontSize: '0.7rem', backgroundColor: '#dbeafe', color: '#0c4a6e', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6' }}>
                        {addr.street}<br />
                        {addr.city}, {addr.county} {addr.postal_code}<br />
                        {addr.country}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
