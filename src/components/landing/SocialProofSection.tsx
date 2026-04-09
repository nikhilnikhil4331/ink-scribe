import React from 'react';
import { motion } from 'framer-motion';
import { Star, Users, FileText, Download } from 'lucide-react';

const stats = [
  { icon: Users, value: '10,000+', label: 'Active Users' },
  { icon: FileText, value: '500K+', label: 'Notes Generated' },
  { icon: Download, value: '200K+', label: 'PDFs Exported' },
  { icon: Star, value: '4.9/5', label: 'User Rating' },
];

const testimonials = [
  {
    name: 'Priya S.',
    role: 'Engineering Student',
    text: "NikNote saved me hours of rewriting lab notes. The handwriting looks so real my professor couldn't tell the difference!",
    rating: 5,
  },
  {
    name: 'Rahul K.',
    role: 'Teacher',
    text: 'I use it to create worksheets and sample answers. The paper styles are exactly what I need for classroom materials.',
    rating: 5,
  },
  {
    name: 'Ananya M.',
    role: 'Content Creator',
    text: 'The aesthetic of handwritten notes in my videos went from "meh" to stunning. Export quality is incredible.',
    rating: 5,
  },
];

export const SocialProofSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center"
            >
              <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Loved by Students & Creators
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-3xl border border-border/50 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-foreground mb-4 leading-relaxed text-sm">"{t.text}"</p>
              <div>
                <p className="font-semibold text-foreground text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
