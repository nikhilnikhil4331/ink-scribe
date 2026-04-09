import React from 'react';
import { motion } from 'framer-motion';
import { 
  Pen, 
  Palette, 
  FileText, 
  Sparkles, 
  Download, 
  Mic,
  Sliders,
  BookOpen,
} from 'lucide-react';

const features = [
  {
    icon: Pen,
    title: '16+ Handwriting Styles',
    description: 'From neat cursive to casual print — each with adjustable randomness so it never looks robotic.',
  },
  {
    icon: Palette,
    title: '12 Ink Colors',
    description: 'Classic blue, black, red, green, and more. Match any notebook or assignment requirement.',
  },
  {
    icon: FileText,
    title: 'Multiple Paper Types',
    description: 'Ruled, college-ruled, graph, dotted, plain, and legal paper with adjustable margins.',
  },
  {
    icon: Sliders,
    title: 'Natural Imperfections',
    description: 'Baseline jitter, stroke variation, and spacing randomness make output look genuinely handwritten.',
  },
  {
    icon: Download,
    title: 'PDF & Image Export',
    description: 'Export multi-page PDFs at 300 DPI. Also download individual pages as PNG images.',
  },
  {
    icon: BookOpen,
    title: 'Save Projects & Presets',
    description: 'Save your work, come back to edit, and reuse your favorite style combinations.',
  },
  {
    icon: Sparkles,
    title: 'AI Writing Assistant',
    description: 'Get smart suggestions to improve your notes, fix grammar, or expand ideas.',
  },
  {
    icon: Mic,
    title: 'Voice Dictation',
    description: 'Speak your thoughts and watch them transform into handwritten notes in real time.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const FeatureShowcase: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 text-foreground">
            Everything You Need for{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Perfect Notes
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed to make your handwritten notes look authentic and professional.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative p-6 bg-card rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
