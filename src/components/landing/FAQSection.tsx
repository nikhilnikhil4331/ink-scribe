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
    question: 'NikNote kya hai? Kaise kaam karta hai?',
    answer: 'NikNote ek AI-powered study app hai Indian students ke liye. Type karo text → 16+ handwriting styles mein convert → PDF export. Plus: AI Teacher (Hindi+English), Quiz Generator, Flashcards, Mind Maps — sab ek jagah! Internet bina bhi 28+ subjects ka instant explanation milta hai.',
  },
  {
    question: 'Kya NikNote free hai?',
    answer: 'Haan! NikNote free mein start kar sakte ho. Free plan mein handwriting notes, AI Teacher, 28+ subjects, quiz generator — sab kuch milta hai. Premium mein extra pages, no watermark, aur advanced AI features milte hain. No credit card needed!',
  },
  {
    question: 'Phone pe kaam karta hai?',
    answer: 'Bilkul! NikNote mobile-friendly hai — Chrome, Safari, kisi bhi browser pe chalta hai. PWA install karke app jaisa use kar sakte ho. Offline bhi 28+ subjects ka AI explanation kaam karta hai!',
  },
  {
    question: 'Kya handwriting real lagti hai?',
    answer: 'Haan! 16+ handwriting styles hain — neat cursive se lekar casual print tak. Har style mein natural imperfections hain (baseline jitter, stroke variation, spacing randomness) toh output genuinely handwritten lagta hai. Professor bhi nahi bata sakte! 😄',
  },
  {
    question: 'AI Teacher kaise kaam karta hai?',
    answer: 'Koi bhi topic puchiye — "Newton ke laws samjhao", "Photosynthesis explain karo" — AI Teacher turant Hindi + English mein samjhata hai. Beginner se lekar exam-level tak. 28+ subjects built-in hain, internet bina bhi kaam karta hai!',
  },
  {
    question: 'CBSE/ICSE/JEE/NEET ke liye useful hai?',
    answer: 'Bilkul! NikNote specifically Indian exams ke liye design kiya gaya hai. NCERT pattern ke notes, JEE/NEET ke liye quiz practice, CBSE board exam format — sab available hai. Hindi medium students ke liye bhi Hindi mein explanations milte hain!',
  },
  {
    question: 'PDF export kaise karein?',
    answer: 'Notes bana ke simply "Export PDF" button dabao. 300 DPI print-ready PDF milta hai — A4 size, perfect for printing. Individual pages PNG mein bhi download kar sakte ho. WhatsApp pe directly share bhi kar sakte ho!',
  },
  {
    question: 'Assignment ke liye use karna ethical hai?',
    answer: 'NikNote legitimate study tool hai — personal notes, revision, teaching materials, creative projects ke liye. Academic integrity ka respect karein. AI Teacher se samjho, notes banao, quiz practice karo — smart study ke liye use karo!',
  },
  {
    question: 'Kya offline kaam karta hai?',
    answer: 'Haan! 28+ subjects ka AI explanation offline bhi kaam karta hai. PWA install karke app jaisa use karo — internet ke bina bhi basic features available hain. Full AI features ke liye internet chahiye.',
  },
  {
    question: 'Payment kaise hai? UPI accept hota hai?',
    answer: 'Haan! UPI, credit card, debit card — sab accept hota hai. Razorpay integration hai, fully secure. Premium plan bahut affordable hai — ek chai se sasta! ☕',
  },
];

export const FAQSection: React.FC = () => {
  return (
    <section id="faq" className="py-24 bg-background">
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
            Sawaal Jawab 💡
          </h2>
          <p className="text-muted-foreground">Common questions — Hinglish mein jawab!</p>
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
                <AccordionTrigger className="text-left text-foreground font-medium py-5 hover:no-underline text-sm sm:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-sm">
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
