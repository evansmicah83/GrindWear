import { Facebook, Instagram, Twitter, Youtube, Smartphone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Subscribed!', { description: 'Welcome to the GRIND BYTE community 🎉' });
    setEmail('');
  };

  const links = {
    Shop: [
      { name: 'New Arrivals', href: '/products?sort=newest' },
      { name: 'Best Sellers', href: '/products?sort=bestsellers' },
      { name: 'Sale', href: '/products?sale=true' },
      { name: 'All Products', href: '/products' },
    ],
    Help: [
      { name: 'Track Order', href: '/track-order' },
      { name: 'Returns', href: '/returns' },
      { name: 'Size Guide', href: '/size-guide' },
      { name: 'FAQ', href: '/faq' },
    ],
  };

  const socials = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-grind-black text-white mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main grid */}
        <div className="py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-white/10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="/" className="text-2xl font-black mb-4 inline-block">
              GRIND<span className="text-grind-blue">BYTE</span>
            </a>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Kenya's premier streetwear brand. Premium quality, authentic style, delivered to your doorstep.
            </p>
            <div className="flex gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-grind-blue flex items-center justify-center transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-bold text-sm mb-5 text-white">{title}</h4>
              <ul className="space-y-3">
                {items.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-1.5 group">
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-3.5 group-hover:ml-0" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact + Newsletter */}
          <div>
            <h4 className="font-bold text-sm mb-5 text-white">Stay Connected</h4>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2.5 text-sm text-gray-400">
                <Smartphone size={15} className="text-grind-blue flex-shrink-0" />
                <a href="tel:+254712345678" className="hover:text-white transition-colors">+254 712 345 678</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-400">
                <Mail size={15} className="text-grind-blue flex-shrink-0" />
                <a href="mailto:hello@grindbyte.co.ke" className="hover:text-white transition-colors">hello@grindbyte.co.ke</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-400">
                <MapPin size={15} className="text-grind-blue flex-shrink-0" />
                <span>Nairobi, Kenya</span>
              </li>
            </ul>

            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-grind-blue"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-grind-blue text-white rounded-xl text-sm font-semibold hover:bg-grind-blue/85 transition-colors flex-shrink-0"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">© 2026 GRIND BYTE. All rights reserved. Made in Kenya 🇰🇪</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">We accept:</span>
            {['M-PESA', 'VISA', 'Mastercard'].map((p) => (
              <span key={p} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-gray-300">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
