import { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Settings, MessageCircle, Phone, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function AdminSettingsPage() {
  const { isAuthenticated, user, token } = useAuth();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    fetchWhatsappNumber();
  }, [isAuthenticated, token]);

  const fetchWhatsappNumber = async () => {
    try {
      const res = await fetch('/api/misc/whatsapp-number');
      if (res.ok) {
        const data = await res.json();
        setWhatsappNumber(data.number);
        setNewNumber(data.number);
      }
    } catch (error) {
      console.error('Failed to fetch WhatsApp number:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleUpdateWhatsappNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!newNumber.trim()) {
      toast.error('Please enter a WhatsApp number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/misc/whatsapp-number', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ number: newNumber })
      });

      if (res.ok) {
        setWhatsappNumber(newNumber);
        toast.success('WhatsApp number updated successfully!');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to update WhatsApp number');
      }
    } catch (error) {
      toast.error('Error updating WhatsApp number');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ef4444' }}>
          <AlertCircle size={48} style={{ margin: '0 auto', marginBottom: '16px' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Access Denied</h1>
          <p style={{ marginTop: '8px', color: '#6b7280' }}>Only admins can access this page</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#111', marginBottom: '8px' }}>
            Admin Settings
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.9375rem' }}>
            Manage system settings and integrations
          </p>
        </div>

        {/* WhatsApp Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            marginBottom: '24px'
          }}
        >
          {/* Card Header */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#25D366',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <MessageCircle size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111' }}>
                WhatsApp Business Integration
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>
                Configure the WhatsApp number for customer support
              </p>
            </div>
          </div>

          {/* Card Content */}
          <div style={{ padding: '24px' }}>
            {fetching ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                Loading settings...
              </div>
            ) : (
              <form onSubmit={handleUpdateWhatsappNumber}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#111',
                    marginBottom: '8px'
                  }}>
                    <Phone size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    WhatsApp Business Number
                  </label>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '12px' }}>
                    Format: Country code + number (e.g., 254700000000 for Kenya)
                  </p>
                  <input
                    type="text"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder="e.g., 254700000000"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      fontFamily: 'monospace',
                      letterSpacing: '0.5px'
                    }}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#25D366';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37, 211, 102, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Current Setting Display */}
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #dcfce7',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Check size={16} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Current Setting
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#166534', fontFamily: 'monospace' }}>
                    {whatsappNumber}
                  </p>
                </div>

                {/* Test WhatsApp */}
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111', marginBottom: '12px' }}>
                    Test Configuration
                  </p>
                  <a
                    href={`https://wa.me/${newNumber}?text=Hi%20GRIND%20BYTE!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      backgroundColor: '#f0fdf4',
                      color: '#10b981',
                      border: '1px solid #dcfce7',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#dcfce7';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#f0fdf4';
                    }}
                  >
                    <MessageCircle size={16} />
                    Send Test Message
                  </a>
                </div>

                {/* Info Box */}
                <div style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '24px'
                }}>
                  <p style={{ fontSize: '0.875rem', color: '#1e40af', lineHeight: '1.6' }}>
                    <strong>ℹ️ Note:</strong> This number is used for the WhatsApp chat widget on the customer-facing site. Customers can reach you directly via WhatsApp.
                  </p>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || newNumber === whatsappNumber}
                    style={{
                      padding: '12px 28px',
                      backgroundColor: loading || newNumber === whatsappNumber ? '#d1d5db' : '#25D366',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: loading || newNumber === whatsappNumber ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {loading ? 'Saving...' : 'Save WhatsApp Number'}
                  </motion.button>
                  {newNumber !== whatsappNumber && (
                    <button
                      type="button"
                      onClick={() => setNewNumber(whatsappNumber)}
                      style={{
                        padding: '12px 28px',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </motion.div>

        {/* Additional Settings Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Settings size={24} style={{ color: '#6b7280' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111' }}>
              More Admin Features Coming Soon
            </h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              'Email notification settings',
              'SMS gateway configuration',
              'Automated response templates',
              'Chat analytics and history',
              'Customer segmentation',
              'Broadcasting messages'
            ].map((feature, i) => (
              <li
                key={i}
                style={{
                  padding: '12px 0',
                  borderBottom: i < 5 ? '1px solid #f3f4f6' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: 0.6
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d1d5db' }} />
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{feature}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </MainLayout>
  );
}
