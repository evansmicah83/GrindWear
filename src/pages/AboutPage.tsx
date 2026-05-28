import { ArrowRight, MapPin, Heart, Zap, Shield, Users, Instagram } from 'lucide-react';
import { motion } from 'motion/react';
import { MainLayout } from '../layouts/MainLayout';
import grindBg from '../assets/Grind.png';

const TEAM = [
  { name: 'Jayden Otieno', role: 'Founder & Creative Director', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
  { name: 'Amara Wanjiku', role: 'Head of Design', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400' },
  { name: 'Brian Kamau', role: 'Operations Lead', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
  { name: 'Cynthia Achieng', role: 'Brand & Marketing', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
];

const VALUES = [
  { icon: Heart, title: 'Culture First', desc: 'Every design is rooted in Kenyan street culture — bold, authentic, and unapologetically local.' },
  { icon: Shield, title: 'Uncompromising Quality', desc: 'We source premium fabrics and work with skilled artisans to ensure every piece lasts.' },
  { icon: Zap, title: 'Built for the Grind', desc: 'Our clothes move with you — from the streets to the studio, from hustle to celebration.' },
  { icon: Users, title: 'Community Driven', desc: 'GRIND BYTE is more than a brand. It\'s a movement built by and for the people who wear it.' },
];

const MILESTONES = [
  { year: '2020', title: 'The Beginning', desc: 'Started in a small workshop in Nairobi\'s CBD with just 3 designs and a dream.' },
  { year: '2021', title: 'First 1,000 Orders', desc: 'Word spread fast. We hit our first thousand orders within 8 months of launching.' },
  { year: '2022', title: 'Flagship Store Opens', desc: 'Opened our first physical store on Tom Mboya Street, Nairobi.' },
  { year: '2023', title: 'Going Regional', desc: 'Expanded shipping to Uganda, Tanzania, and Rwanda. East Africa is wearing the Grind.' },
  { year: '2024', title: '12K+ Customers', desc: 'Over 12,000 happy customers and counting. The community keeps growing.' },
  { year: '2026', title: 'New Collection', desc: 'Our boldest collection yet — designed for the next generation of Kenyan creatives.' },
];

export function AboutPage() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-grind-black">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${grindBg})`, opacity: 0.2 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-grind-blue font-semibold text-xs uppercase tracking-widest mb-4">Our Story</p>
            <h1 className="text-6xl sm:text-7xl font-black text-white leading-tight mb-6">
              MADE IN KENYA.<br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">WORN WORLDWIDE.</span>
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
              Born on the streets of Nairobi, built for the world. Every stitch tells a story of hustle, culture, and pride.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-grind-blue font-semibold text-xs uppercase tracking-widest mb-3">Who We Are</p>
            <h2 className="text-4xl font-black text-gray-900 mb-6 leading-tight">We don't follow trends.<br />We set them.</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              GRIND BYTE was founded in 2020 by a group of young Nairobians who were tired of paying premium prices for foreign streetwear that didn't reflect their identity. We set out to build something different — a brand that speaks the language of the streets we grew up on.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8">
              Today, we're one of Kenya's fastest-growing streetwear labels, shipping to customers across East Africa and beyond. But our roots remain firmly planted in Nairobi.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin size={16} className="text-grind-blue" />
              <span>Tom Mboya Street, Nairobi, Kenya 🇰🇪</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: '12K+', label: 'Happy Customers' },
                { val: '500+', label: 'Products Designed' },
                { val: '4.9★', label: 'Average Rating' },
                { val: '4+', label: 'Countries Reached' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                  <p className="text-3xl font-black text-gray-900">{s.val}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-grind-blue font-semibold text-xs uppercase tracking-widest mb-3">What Drives Us</p>
            <h2 className="text-4xl font-black text-gray-900">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="w-11 h-11 bg-grind-black rounded-xl flex items-center justify-center mb-4">
                  <v.icon size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-14">
          <p className="text-grind-blue font-semibold text-xs uppercase tracking-widest mb-3">How We Got Here</p>
          <h2 className="text-4xl font-black text-gray-900">Our Journey</h2>
        </div>
        <div className="relative">
          <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2" />
          <div className="space-y-10">
            {MILESTONES.map((m, i) => (
              <motion.div key={m.year} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className={`relative flex items-start gap-6 sm:gap-0 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                {/* Dot */}
                <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-grind-black border-2 border-white shadow mt-1.5" />
                {/* Content */}
                <div className={`ml-14 sm:ml-0 sm:w-[45%] bg-white rounded-2xl p-5 border border-gray-100 shadow-sm ${i % 2 === 0 ? 'sm:mr-auto sm:pr-10' : 'sm:ml-auto sm:pl-10'}`}>
                  <span className="inline-block px-2.5 py-0.5 bg-grind-black text-white text-xs font-bold rounded-full mb-2">{m.year}</span>
                  <h3 className="font-bold text-gray-900 mb-1">{m.title}</h3>
                  <p className="text-sm text-gray-500">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-grind-blue font-semibold text-xs uppercase tracking-widest mb-3">The People</p>
            <h2 className="text-4xl font-black text-gray-900">Meet the Team</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group text-center">
                <div className="relative overflow-hidden rounded-2xl aspect-square mb-4">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <a href="https://instagram.com/grindwear_ke" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                      <Instagram size={16} className="text-white" />
                    </a>
                  </div>
                </div>
                <p className="font-bold text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-500">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden bg-grind-black">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-black text-white mb-4">Ready to wear<br />the Grind?</h2>
          <p className="text-white/60 text-lg mb-10">Join thousands of Kenyans who've made GRIND BYTE part of their identity.</p>
          <a href="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg no-underline">
            Shop Now <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </MainLayout>
  );
}
