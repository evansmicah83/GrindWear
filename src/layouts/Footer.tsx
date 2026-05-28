import { useState } from 'react';
import { Instagram, Twitter, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';

const SHOP_LINKS = [
  { name: 'New Arrivals', href: '/products?filter=new' },
  { name: 'Best Sellers', href: '/products?sort=bestsellers' },
  { name: 'Sale', href: '/products?sale=true' },
  { name: 'All Products', href: '/products' },
];

const COMPANY_LINKS = [
  { name: 'About Us', href: '/about' },
  { name: 'Careers', href: '/careers' },
  { name: 'Press', href: '/press' },
  { name: 'Sustainability', href: '/sustainability' },
];

const SUPPORT_LINKS = [
  { name: 'Track Order', href: '/track-order' },
  { name: 'Returns & Exchanges', href: '/returns' },
  { name: 'Shipping Info', href: '/shipping' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'FAQ', href: '/faq' },
];

const SOCIAL = [
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/grindwear_ke', color: 'hover:bg-pink-600' },
  { name: 'TikTok', icon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
    </svg>
  ), href: 'https://tiktok.com/@grindwear_ke', color: 'hover:bg-black' },
  { name: 'Twitter/X', icon: Twitter, href: 'https://twitter.com/grindwear_ke', color: 'hover:bg-sky-500' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@grindbyte', color: 'hover:bg-red-600' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('You\'re subscribed! 🎉', { description: 'Welcome to the GRIND BYTE community.' });
    setEmail('');
    setSubscribing(false);
  };

  return (
    <footer className="bg-grind-black text-white mt-16">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <a href="/" className="inline-block mb-4 no-underline">
              <span className="text-2xl font-black tracking-tight text-white">GRIND BYTE</span>
            </a>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Made in Kenya. Worn Worldwide. Premium streetwear for the modern generation — quality meets culture in every piece.
            </p>

            {/* Social */}
            <div className="flex gap-2 mb-6">
              {SOCIAL.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className={`p-2.5 bg-white/10 rounded-lg transition-all ${s.color} hover:text-white`}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>

            {/* Contact */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-grind-blue flex-shrink-0" />
                <a href="tel:+254712345678" className="hover:text-white transition-colors no-underline">+254 712 345 678</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-grind-blue flex-shrink-0" />
                <a href="mailto:hello@grindbyte.co.ke" className="hover:text-white transition-colors no-underline">hello@grindbyte.co.ke</a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-grind-blue flex-shrink-0" />
                <span>Nairobi, Kenya 🇰🇪</span>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map(l => (
                <li key={l.name}>
                  <a href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors no-underline">{l.name}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-4">Company</h4>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map(l => (
                <li key={l.name}>
                  <a href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors no-underline">{l.name}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-4">Support</h4>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map(l => (
                <li key={l.name}>
                  <a href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors no-underline">{l.name}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-10 border-t border-white/10">
          <div className="max-w-xl">
            <h3 className="text-lg font-bold mb-1">Stay in the loop</h3>
            <p className="text-gray-400 text-sm mb-4">Early access to drops, exclusive discounts, and style alerts.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-grind-blue focus:border-transparent"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-5 py-2.5 bg-grind-blue hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            <p className="text-gray-600 text-xs mt-2">No spam. Unsubscribe anytime. We respect your privacy.</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">© 2026 GRIND BYTE. All rights reserved. Made in Kenya 🇰🇪</p>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">We accept:</span>
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 bg-green-600 rounded text-xs font-bold text-white tracking-wide">M-PESA</div>
              <div className="px-2.5 py-1 bg-blue-700 rounded text-xs font-bold text-white tracking-wide">VISA</div>
              <div className="px-2.5 py-1 bg-red-600 rounded text-xs font-bold text-white tracking-wide">MC</div>
            </div>
          </div>

          <div className="flex gap-4 text-xs text-gray-500">
            <a href="/privacy" className="hover:text-white transition-colors no-underline">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors no-underline">Terms</a>
            <a href="/cookies" className="hover:text-white transition-colors no-underline">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
