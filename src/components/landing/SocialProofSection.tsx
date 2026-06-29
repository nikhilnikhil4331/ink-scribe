import React from 'react';
import { motion } from 'framer-motion';
import { Star, BookOpen, Brain, Zap, Shield } from 'lucide-react';

const stats = [
  { icon: BookOpen, value: '16+', label: 'Handwriting Styles', sub: 'Neat, Cursive, Casual' },
  { icon: Brain, value: '28+', label: 'AI Subjects', sub: 'Instant without API' },
  { icon: Zap, value: '300 DPI', label: 'Export Quality', sub: 'Print-ready PDFs' },
  { icon: Shield, value: 'Free', label: 'To Get Started', sub: 'No credit card needed' },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: '12th CBSE, Delhi',
    text: 'NikNote ne mera bahut kaam aasan kiya! AI Teacher se Newton ke laws samjhe, handwriting notes banaye, aur quiz bhi practice kiya. Ab physics mein 95+ aa rahe hain! 🎉',
    rating: 5,
    avatar: '👩‍🎓',
  },
  {
    name: 'Rahul Kumar',
    role: 'JEE Aspirant, Patna',
    text: 'Bhai ye app kamaal hai! Handwriting itni real lagti hai ki koi bhi nahi bol sakta computer se banayi hai. Aur AI explanations Hindi mein milte hain — jaise tuition teacher samjhaye! 💪',
    rating: 5,
    avatar: '👨‍🎓',
  },
  {
    name: 'Ananya Patel',
    role: 'NEET Prep, Mumbai',
    text: 'Flashcards aur quiz generator ne revision itna easy bana diya. Biology ke saare diagrams aur mind maps bhi mil jaate hain. WhatsApp pe directly share bhi kar sakte hain classmates ko! 📱',
    rating: 5,
    avatar: '👩‍🔬',
  },
  {
    name: 'Vikram Singh',
    role: 'Teacher, Lucknow',
    text: 'As a teacher, I use NikNote to create worksheets and sample answers. The paper styles match exactly what we use in school. My students love the AI-powered explanations! 🏫',
    rating: 5,
    avatar: '👨‍🏫',
  },
  {
    name: 'Sneha Gupta',
    role: 'B.Tech CSE, Jaipur',
    text: 'Lab notes aur assignments ke liye perfect hai! Programming concepts bhi AI se samjh jaate hain. Voice dictation se quickly notes likh leti hoon. Time bachta hai bohot! ⏰',
    rating: 5,
    avatar: '👩‍💻',
  },
  {
    name: 'Arjun Reddy',
    role: 'UPSC Aspirant, Hyderabad',
    text: 'Indian Constitution aur History ke notes handwriting mein banane mein maza hi alag hai! Mind maps se revision fast hota hai. Offline bhi kaam karta hai — travel mein useful! 🚂',
    rating: 5,
    avatar: '👨‍💼',
  },
];

export const SocialProofSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-secondary/20 to-background">
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
              className="text-center p-4 rounded-2xl bg-card/50 border border-border/30"
            >
              <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm font-medium text-foreground">{stat.label}</div>
              <div className="text-[11px] text-muted-foreground">{stat.sub}</div>
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
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-2">
            Students Ka Kehta Hai 💬
          </h2>
          <p className="text-muted-foreground mt-2">Real feedback from real Indian students</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="bg-card rounded-2xl border border-border/50 p-5 hover:shadow-lg hover:border-primary/20 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{t.avatar}</span>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-foreground text-sm leading-relaxed">"{t.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
