import React from 'react';
import { motion } from 'motion/react';
import { Star, Package, Globe, ShieldCheck, Clock, Quote } from 'lucide-react';

const reviews = [
  { name: "Robert Chen", role: "Logistics Director", text: "SwiftTrack has revolutionized how we manage our high-value electronics shipments. The real-time visibility is unmatched.", rating: 5 },
  { name: "Sarah Jenkins", role: "E-commerce Founder", text: "The most reliable logistics partner we've ever worked with. Their customer support is proactive and extremely helpful.", rating: 5 },
  { name: "Marcus Thorne", role: "Global Operations", text: "Security was our main concern for luxury goods. SwiftTrack's secure storage and tracking gave us complete peace of mind.", rating: 5 },
  { name: "Elena Rodriguez", role: "Supply Chain Manager", text: "The dashboard is incredibly intuitive. I can manage hundreds of shipments across continents with just a few clicks.", rating: 5 },
  { name: "David Kim", role: "Tech CEO", text: "Fast, secure, and professional. SwiftTrack is our go-to for all international hardware deliveries.", rating: 5 },
  { name: "Aisha Al-Fayed", role: "Import/Export Specialist", text: "Navigating customs used to be a nightmare. With SwiftTrack, it's handled automatically. Truly a game-changer.", rating: 5 },
  { name: "Thomas Müller", role: "Manufacturing Lead", text: "Precision is key in our industry. SwiftTrack's time-sensitive delivery has never let us down.", rating: 5 },
  { name: "Linda Wu", role: "Retail Chain Owner", text: "The cost-to-value ratio is excellent. We've seen a significant drop in lost consignments since switching.", rating: 5 },
  { name: "James Wilson", role: "Art Gallery Curator", text: "Shipping priceless art requires extreme care. SwiftTrack's specialized handling is the best in the business.", rating: 5 },
  { name: "Sofia Conti", role: "Fashion Designer", text: "Getting our collections to global runways on time is critical. SwiftTrack is our most trusted partner.", rating: 5 },
  { name: "Kevin O'Brien", role: "Pharma Logistics", text: "Temperature-controlled and secure. They handle our sensitive medical supplies with the utmost professionalism.", rating: 5 },
  { name: "Yuki Tanaka", role: "Automotive Parts Dist.", text: "The tracking updates are so detailed, we always know exactly where our parts are in the supply chain.", rating: 5 },
  { name: "Isabella Silva", role: "Wine Exporter", text: "Fragile goods are safe in their hands. We've shipped thousands of cases with zero breakage.", rating: 5 },
  { name: "Ahmed Hassan", role: "Tech Distributor", text: "Their global network is truly impressive. Even the most remote locations are reachable with SwiftTrack.", rating: 5 },
  { name: "Chloe Bennett", role: "Jewelry Designer", text: "The insurance and security protocols they have in place are top-notch. I wouldn't trust anyone else with my pieces.", rating: 5 }
];

export default function ReviewsPage() {
  return (
    <div className="flex flex-col gap-24 sm:gap-40 py-12">
      {/* Hero Section - Editorial Split */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end">
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-accent"></div>
            <span className="text-micro text-accent tracking-[0.2em]">CLIENT TESTIMONIALS</span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl sm:text-9xl font-black tracking-tighter text-primary leading-[0.85] heading-display uppercase"
          >
            Trusted by <br />
            <span className="text-muted/30 italic font-serif lowercase">Thousands</span>.
          </motion.h1>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-8 pb-4"
        >
          <p className="text-xl sm:text-2xl text-muted leading-relaxed font-medium max-w-xl">
            Don't just take our word for it. Here's what our global partners and clients have to say about SwiftTrack's logistics solutions.
          </p>
        </motion.div>
      </section>

      {/* Reviews Grid - Technical Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-primary/10">
        {reviews.map((review, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: (i % 3) * 0.1 }}
            viewport={{ once: true }}
            className="bg-white p-12 flex flex-col gap-10 border-r border-b border-primary/10 last:border-r-0 group hover:bg-primary transition-all duration-500"
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-1">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-accent fill-accent" />
                ))}
              </div>
              <Quote className="w-8 h-8 text-primary/10 group-hover:text-white/10 transition-colors" />
            </div>
            
            <p className="text-2xl font-medium text-primary group-hover:text-white leading-relaxed italic font-serif transition-colors">
              "{review.text}"
            </p>
            
            <div className="flex items-center gap-5 mt-auto pt-8 border-t border-primary/5 group-hover:border-white/10 transition-colors">
              <div className="w-12 h-12 bg-primary group-hover:bg-accent flex items-center justify-center text-white text-sm font-black transition-colors">
                {review.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="font-black text-primary group-hover:text-white text-sm uppercase tracking-widest transition-colors">{review.name}</span>
                <span className="text-micro text-muted group-hover:text-white/60 uppercase transition-colors">{review.role}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Dynamic CTA Section - Full Screen Split */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[60vh]">
        <div className="bg-primary text-white p-12 sm:p-24 flex flex-col justify-center gap-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <span className="text-[20vw] font-black leading-none heading-display uppercase select-none">JOIN.</span>
          </div>
          <div className="relative z-10 flex flex-col gap-8">
            <span className="text-micro text-accent tracking-[0.2em]">GET STARTED</span>
            <h2 className="text-5xl sm:text-7xl font-black tracking-tighter heading-display uppercase leading-none">
              Join our network of <br />
              <span className="text-white/30 italic font-serif lowercase">satisfied</span> clients.
            </h2>
            <p className="text-xl text-white/60 max-w-xl font-medium leading-relaxed">
              Experience the SwiftTrack difference today. Secure, transparent, and global logistics for the modern world.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 relative z-10">
            <button className="btn-primary">Get Started Now</button>
            <button className="btn-secondary !border-white !text-white hover:!bg-white hover:!text-primary">Contact Sales</button>
          </div>
        </div>
        <div className="bg-accent p-12 sm:p-24 flex flex-col justify-center items-center text-center gap-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent"></div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-48 h-48 border-2 border-white/30 rounded-full flex items-center justify-center relative"
          >
            <div className="absolute inset-0 border border-white/10 rounded-full scale-125"></div>
            <Package className="w-20 h-20 text-white" />
          </motion.div>
          <div className="flex flex-col gap-4">
            <span className="text-5xl sm:text-8xl font-black text-white heading-display tracking-tighter">99.9%</span>
            <span className="text-micro text-white/60 tracking-[0.3em] font-mono">DELIVERY SUCCESS RATE</span>
          </div>
        </div>
      </section>
    </div>
  );
}
