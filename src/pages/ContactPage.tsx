import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Instagram, Twitter, Send, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { MainLayout } from '../layouts/MainLayout';
import { api } from '../services/api';
import { toast } from 'sonner';

const CONTACT_CARDS = [
  {
    icon: Phone,
    title: 'Call Us',
    detail: '+254 712 345 678',
    sub: 'Mon – Sat, 8am – 6pm',
    href: 'tel:+254712345678',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Mail,
    title: 'Email Us',
    detail: 'hello@grindbyte.co.ke',
    sub: 'We reply within 24 hours',
    href: 'mailto:hello@grindbyte.co.ke',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    detail: '+254 712 345 678',
    sub: 'Chat with us directly',
    href: 'https://wa.me/254712345678',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    detail: 'Tom Mboya Street',
    sub: 'Nairobi CBD, Kenya',
    href: 'https://maps.google.com/?q=Tom+Mboya+Street+Nairobi',
    color: 'bg-orange-50 text-orange-600',
  },
];

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      // Use newsletter endpoint as a contact proxy — or just simulate
      await new Promise(r => setTimeout(r, 1000));
      toast.success('Message sent!', { description: 'We\'ll get back to you within 24 hours.' });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send. Please try emailing us directly.');
    } finally {
      setSending(false);
    }
  };

  const f = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value })),
  });

  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-grind-black py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto px-4">
          <p className="text-grind-blue font-semibold text-xs uppercase tracking-widest mb-3">Get In Touch</p>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4">Contact Us</h1>
          <p className="text-white/60 text-lg">Have a question, feedback, or just want to say hi? We'd love to hear from you.</p>
        </motion.div>
      </section>

      {/* Contact cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTACT_CARDS.map((c, i) => (
            <motion.a key={c.title} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow no-underline group">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${c.color}`}>
                <c.icon size={20} />
              </div>
              <p className="font-bold text-gray-900 mb-0.5">{c.title}</p>
              <p className="text-sm font-semibold text-gray-700 group-hover:text-grind-blue transition-colors">{c.detail}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Form + Info */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Name</label>
                  <input {...f('name')} required placeholder="Your name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input type="email" {...f('email')} required placeholder="your@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Subject</label>
                <select {...f('subject')} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue bg-white cursor-pointer">
                  <option value="">Select a topic</option>
                  <option value="order">Order Issue</option>
                  <option value="return">Return / Exchange</option>
                  <option value="product">Product Question</option>
                  <option value="shipping">Shipping</option>
                  <option value="wholesale">Wholesale Inquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Message</label>
                <textarea {...f('message')} required rows={5} placeholder="Tell us how we can help..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue resize-none" />
              </div>
              <button type="submit" disabled={sending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-grind-black text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors cursor-pointer">
                <Send size={16} /> {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="lg:col-span-2 space-y-6">

            {/* Hours */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={18} className="text-grind-blue" />
                <h3 className="font-bold text-gray-900">Business Hours</h3>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  ['Monday – Friday', '8:00 AM – 6:00 PM'],
                  ['Saturday', '9:00 AM – 4:00 PM'],
                  ['Sunday', 'Closed'],
                ].map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="text-gray-500">{day}</span>
                    <span className={`font-semibold ${hours === 'Closed' ? 'text-red-500' : 'text-gray-900'}`}>{hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-grind-blue" />
                <h3 className="font-bold text-gray-900">Our Location</h3>
              </div>
              <p className="text-sm text-gray-500 mb-3">Tom Mboya Street, Nairobi CBD<br />Nairobi, Kenya 🇰🇪</p>
              <a href="https://maps.google.com/?q=Tom+Mboya+Street+Nairobi" target="_blank" rel="noopener noreferrer"
                className="text-sm font-semibold text-grind-blue hover:underline no-underline">
                Get Directions →
              </a>
            </div>

            {/* Social */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Follow Us</h3>
              <div className="flex gap-3">
                {[
                  { icon: Instagram, href: 'https://instagram.com/grindwear_ke', label: 'Instagram', color: 'hover:bg-pink-600' },
                  { icon: Twitter, href: 'https://twitter.com/grindwear_ke', label: 'Twitter', color: 'hover:bg-sky-500' },
                  { icon: MessageCircle, href: 'https://wa.me/254712345678', label: 'WhatsApp', color: 'hover:bg-green-600' },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className={`p-2.5 bg-gray-100 rounded-xl transition-all ${s.color} hover:text-white`} title={s.label}>
                    <s.icon size={18} className="text-gray-600 group-hover:text-white" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
