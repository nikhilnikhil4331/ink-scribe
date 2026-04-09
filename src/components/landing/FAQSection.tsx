import React from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How does NikNote turn text into handwriting?',
    answer: 'NikNote uses specially designed handwriting fonts with natural imperfections — slight spacing variations, baseline jitter, and stroke randomness — to produce output that looks authentically handwritten. You type or paste your text, choose a style, and the engine renders it onto realistic paper backgrounds.',
  },
  {
    question: 'What file formats can I export?',
    answer: 'You can export your handwritten notes as PDF (single or multi-page) and as PNG/JPG images per page. PDFs are formatted to A4 size at 300 DPI for print-quality results.',
  },
  {
    question: 'Is NikNote free to use?',
    answer: 'Yes! The free plan lets you export up to 2 pages per document with a small watermark. Paid plans remove the watermark, increase page limits, and unlock all handwriting styles and paper types.',
  },
  {
    question: 'Can I use NikNote on my phone?',
    answer: 'Absolutely. NikNote is fully responsive and works on any modern browser — desktop, tablet, or mobile. The mobile UI uses a step-by-step flow optimized for smaller screens.',
  },
  {
    question: 'What handwriting styles are available?',
    answer: 'NikNote offers 16+ handwriting fonts ranging from neat cursive to casual print, each with adjustable randomness to control how "human" the output looks. You can also customize ink color, font size, line spacing, and word spacing.',
  },
  {
    question: 'What paper types can I choose?',
    answer: 'Choose from ruled, college-ruled, graph, dotted, plain, and legal paper styles. Each comes with adjustable margins and optional header/footer areas for names, dates, and titles.',
  },
  {
    question: 'Is it ethical to use NikNote for assignments?',
    answer: 'NikNote is designed for legitimate use cases: personal notes, creative projects, teaching materials, and professional documents. We strongly discourage using it to violate academic integrity policies. Please use responsibly.',
  },
  {
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel anytime from your Account settings. Your paid features remain active until the end of your billing period. No questions asked.',
  },
];

export const FAQSection: React.FC = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 text-foreground">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border/50 rounded-2xl px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left text-foreground font-medium py-5 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
