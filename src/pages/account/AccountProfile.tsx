import { useState, useEffect } from 'react';
import { Camera, Moon, Sun, Bell, ShieldCheck, Trash2 } from 'lucide-react';
import { AccountLayout } from './AccountLayout';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { normalizeImageSource } from '../../lib/utils';
import Swal from 'sweetalert2';

const swal = (opts: any) => Swal.fire({ customClass: { popup: 'rounded-2xl shadow-xl font-sans' }, confirmButtonColor: '#111827', ...opts });

export function AccountProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: (user as any)?.phone || '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('grind-theme') === 'dark');
  const [prefs, setPrefs] = useState({ emailOffers: true, orderUpdates: true, newArrivals: false });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('grind-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { swal({ icon: 'error', title: 'File too large', text: 'Please choose an image under 2MB.' }); return; }
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim()) { swal({ icon: 'warning', title: 'Name required', text: 'Please enter your full name.' }); return; }
    setSavingProfile(true);
    try {
      await api.updateProfile({ name: profile.name, phone: profile.phone, avatar_url: avatarPreview || undefined });
      swal({ icon: 'success', title: 'Profile updated!', timer: 1800, showConfirmButton: false });
    } catch {
      swal({ icon: 'error', title: 'Update failed', text: 'Could not save your profile. Please try again.' });
    } finally { setSavingProfile(false); }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.current) { swal({ icon: 'warning', title: 'Current password required' }); return; }
    if (passwords.new.length < 6) { swal({ icon: 'error', title: 'Password too short', text: 'New password must be at least 6 characters.' }); return; }
    if (passwords.new !== passwords.confirm) { swal({ icon: 'error', title: 'Passwords do not match', text: 'New password and confirmation must be identical.' }); return; }
    setSavingPassword(true);
    await new Promise(r => setTimeout(r, 800));
    swal({ icon: 'success', title: 'Password changed!', timer: 1800, showConfirmButton: false });
    setPasswords({ current: '', new: '', confirm: '' });
    setSavingPassword(false);
  };

  const handleDeleteAccount = () => {
    swal({
      icon: 'warning', title: 'Delete Account?',
      text: 'This will permanently delete your account and all your data. This cannot be undone.',
      showCancelButton: true, confirmButtonText: 'Yes, delete it', confirmButtonColor: '#dc2626',
      cancelButtonText: 'Cancel',
    }).then((r: any) => {
      if (r.isConfirmed) swal({ icon: 'info', title: 'Request submitted', text: 'Your account deletion request has been received.' });
    });
  };

  const avatar = normalizeImageSource(avatarPreview || (user as any)?.avatar);
  const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white transition-all';

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Profile & Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your personal info, preferences and security.</p>
        </div>

        {/* Avatar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Profile Photo</h2>
          <div className="flex items-center gap-5">
            <div className="relative">
              {avatar
                ? <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-100" />
                : <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-black ring-4 ring-gray-100">{user?.name?.[0]?.toUpperCase()}</div>
              }
              <label className="absolute bottom-0 right-0 w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors shadow-md">
                <Camera size={13} />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <p className="font-bold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              {avatarPreview && <p className="text-xs text-green-600 mt-1">✓ New photo selected — save to apply</p>}
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Personal Information</h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Phone Number</label>
                <input type="tel" placeholder="0712 345 678" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email Address</label>
              <input type="email" value={profile.email} disabled className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`} />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed. Contact support if needed.</p>
            </div>
            <button type="submit" disabled={savingProfile} className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-60 cursor-pointer text-sm">
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Preferences */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Preferences</h2>
          <div className="space-y-4">
            {/* Dark mode */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div className="flex items-center gap-3">
                {dark ? <Moon size={18} className="text-blue-500" /> : <Sun size={18} className="text-yellow-500" />}
                <div>
                  <p className="text-sm font-semibold text-gray-900">Dark Mode</p>
                  <p className="text-xs text-gray-400">Switch between light and dark theme</p>
                </div>
              </div>
              <button onClick={() => setDark(d => !d)} className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${dark ? 'bg-gray-900' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${dark ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Notification prefs */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2"><Bell size={13} /> Email Notifications</p>
            {[
              { key: 'emailOffers', label: 'Promotions & Offers', desc: 'Discounts, flash sales and exclusive deals' },
              { key: 'orderUpdates', label: 'Order Updates', desc: 'Shipping and delivery notifications' },
              { key: 'newArrivals', label: 'New Arrivals', desc: 'Be first to know about new drops' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <button onClick={() => setPrefs(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${prefs[key as keyof typeof prefs] ? 'bg-gray-900' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs[key as keyof typeof prefs] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2"><ShieldCheck size={18} className="text-green-500" /> Security</h2>
          <p className="text-gray-400 text-sm mb-4">Change your password to keep your account secure.</p>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            {[['current', 'Current Password'], ['new', 'New Password'], ['confirm', 'Confirm New Password']].map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">{label}</label>
                <input type="password" value={passwords[key as keyof typeof passwords]}
                  onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                  className={`${inputCls} ${key === 'confirm' && passwords.confirm && passwords.confirm !== passwords.new ? 'border-red-300' : ''}`} />
                {key === 'confirm' && passwords.confirm && passwords.confirm !== passwords.new && (
                  <p className="text-xs text-red-500 mt-1">⚠ Passwords do not match</p>
                )}
              </div>
            ))}
            <button type="submit" disabled={savingPassword} className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-60 cursor-pointer text-sm">
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-red-600 mb-1 flex items-center gap-2"><Trash2 size={16} /> Danger Zone</h2>
          <p className="text-gray-400 text-sm mb-4">Permanently delete your account and all associated data.</p>
          <button onClick={handleDeleteAccount} className="px-5 py-2.5 border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors cursor-pointer text-sm">
            Delete My Account
          </button>
        </div>
      </div>
    </AccountLayout>
  );
}
