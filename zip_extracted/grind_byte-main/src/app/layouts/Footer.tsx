import { Facebook, Instagram, Twitter, Youtube, Smartphone, Mail, MapPin, CreditCard, Shield, Truck } from 'lucide-react';

export function Footer() {
  const quickLinks = [
    { name: 'New Arrivals', href: '/products?sort=newest' },
    { name: 'Best Sellers', href: '/products?sort=bestsellers' },
    { name: 'Sale', href: '/products?sale=true' },
    { name: 'Track Order', href: '/track-order' }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:bg-blue-600' },
    { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:bg-pink-600' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:bg-sky-500' },
    { name: 'YouTube', icon: Youtube, href: '#', color: 'hover:bg-red-600' }
  ];

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'Orders over KES 5,000' },
    { icon: Shield, title: 'Secure Payment', desc: 'M-Pesa & Cards accepted' },
    { icon: CreditCard, title: 'Easy Returns', desc: '30-day return policy' }
  ];

  return (
    <footer className="bg-white border-t border-grind-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-grind-border">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
              <div className="p-3 bg-grind-blue/10 rounded-lg">
                <feature.icon className="text-grind-blue" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-grind-black mb-1">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-grind-black mb-4">GRIND BYTE</h3>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Kenya's premier streetwear brand. Premium quality, authentic style, delivered to your doorstep.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className={`p-2.5 bg-gray-100 rounded-lg transition-all ${social.color} hover:text-white`}
                  aria-label={social.name}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-grind-black mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-grind-blue transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-grind-blue transition-colors" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-grind-black mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <Smartphone className="text-grind-blue mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="text-gray-600">Call us</p>
                  <a href="tel:+254712345678" className="text-grind-black font-medium hover:text-grind-blue">
                    +254 712 345 678
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Mail className="text-grind-blue mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="text-gray-600">Email us</p>
                  <a href="mailto:hello@grindbyte.co.ke" className="text-grind-black font-medium hover:text-grind-blue">
                    hello@grindbyte.co.ke
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="text-grind-blue mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="text-gray-600">Visit us</p>
                  <p className="text-grind-black font-medium">
                    Nairobi, Kenya
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-grind-black mb-4">Newsletter</h4>
            <p className="text-gray-600 text-sm mb-4">
              Subscribe for exclusive deals and early access to new drops
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 text-sm border border-grind-border rounded-lg focus:outline-none focus:ring-2 focus:ring-grind-blue"
              />
              <button className="px-4 py-2 bg-grind-black text-white rounded-lg hover:bg-grind-black/90 transition-colors text-sm font-medium">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-grind-border py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © 2026 GRIND BYTE. All rights reserved. Made in Kenya 🇰🇪
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">We accept:</span>
              <div className="flex gap-2">
                <div className="px-3 py-1.5 bg-gray-100 rounded text-xs font-semibold">M-PESA</div>
                <div className="px-3 py-1.5 bg-gray-100 rounded text-xs font-semibold">VISA</div>
                <div className="px-3 py-1.5 bg-gray-100 rounded text-xs font-semibold">MC</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
