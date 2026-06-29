import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Tag, Share2, MessageCircle, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { trackShare } from '@/utils/referral';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  tags: string[];
  content: string;
}

const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-convert-text-to-handwriting',
    title: 'Text ko Handwriting mein Convert kaise karein? — Complete Guide 2026',
    excerpt: 'Step-by-step guide: Typed text ko realistic handwritten notes mein convert karna. 16+ styles, paper types, ink colors. Free tool!',
    category: 'Tutorial',
    readTime: '5 min',
    date: '2026-06-29',
    tags: ['handwriting', 'tutorial', 'notes', 'free tool'],
    content: `## Text ko Handwriting mein Convert kaise karein? ✍️

Indian students ke liye yeh bahut common problem hai — notes handwritten chahiye but type karna easy hai. NikNote se ab 30 seconds mein convert ho jaata hai!

### Step 1: Text Type ya Paste Karo
NikNote ke editor mein apna text likho ya kisi source se paste karo. Hindi, English, Hinglish — sab kaam karta hai!

### Step 2: Handwriting Style Choose Karo
16+ handwriting styles available hain:
- **Neat Cursive** — Exam copy jaisi clean writing
- **Casual Print** — Apni normal writing jaisi
- **Teacher Style** — Bold, clear writing for notes
- **Student Quick** — Thoda messy, natural look

### Step 3: Paper & Ink Select Karo
14 paper styles (Ruled, Graph, Dotted, Plain) + 12 ink colors (Blue, Black, Red, Green).

### Step 4: Preview & Export
Live preview dekho, adjustments karo, aur PDF export karo — 300 DPI print-ready!

### Pro Tips 💡
- Baselines jitter option ON karo for natural look
- Word spacing thoda random rakho
- Multiple pages ke liye auto-pagination use karo

**Try free: https://niknote.online** 🚀`,
  },
  {
    slug: 'ai-teacher-hindi-best-study-app',
    title: 'Best AI Teacher for Hindi Medium Students — NikNote AI Review 2026',
    excerpt: 'AI Teacher jo Hindi mein samjhata hai! Newton ke laws, Photosynthesis, Algebra — instant explanation. Free study app for Indian students.',
    category: 'Review',
    readTime: '4 min',
    date: '2026-06-28',
    tags: ['AI teacher', 'Hindi', 'study app', 'free'],
    content: `## Best AI Teacher for Hindi Medium Students 🧠

Agar tum Hindi medium student ho aur English AI tools se padhai nahi ho paati, toh NikNote tumhare liye hai!

### Kya NikNote AI Teacher kya hai?
NikNote mein built-in AI Teacher hai jo **Hindi + English dono mein** explain karta hai. 28+ subjects ka instant explanation — bina internet ke bhi!

### Top Features:
- **Hindi Explanation**: "Newton ke laws samjhao" — turant Hindi mein answer
- **Exam-Focused**: CBSE, ICSE, JEE, NEET pattern ke answers
- **Offline Mode**: 28+ subjects bina internet ke
- **Quiz Generator**: Topic enter karo, quiz questions mil jaayenge
- **Flashcards**: Revision ke liye instant flashcards

### Subjects Available:
Physics, Chemistry, Biology, Mathematics, History, Constitution, English Grammar, Programming, aur bahut kuch!

### Kaise Use Karein:
1. NikNote pe jao → AI tab click karo
2. Topic type karo (Hindi ya English mein)
3. Instant explanation + quiz + flashcards!

**Free try karo: https://niknote.online** 🎓`,
  },
  {
    slug: 'cbse-notes-generator-free',
    title: 'CBSE Notes Generator Free — NCERT Notes Banane ka Sabse Easy Tarika',
    excerpt: 'CBSE NCERT notes generator free. Handwriting style mein notes banao, PDF export karo. Class 9-12 sab ke liye.',
    category: 'Guide',
    readTime: '6 min',
    date: '2026-06-27',
    tags: ['CBSE', 'NCERT', 'notes generator', 'free'],
    content: `## CBSE Notes Generator Free — Ab Notes Banana Easy! 📚

CBSE students ke liye notes banana ab 10x fast hai NikNote se!

### Kya NikNote CBSE ke liye hai?
Bilkul! NikNote specifically Indian students ke liye design kiya gaya hai:
- NCERT pattern ke notes
- CBSE exam format
- Hindi medium support
- Ruled paper (school copy jaisi)

### Kaise Banayein CBSE Notes:
1. **Topic Enter Karo**: "Class 10 Physics Chapter 1" ya "Chemical Reactions and Equations"
2. **AI se Content Generate Karo**: AI Teacher turant explanation dega — Hindi mein bhi!
3. **Handwriting Style Select Karo**: School copy jaisi writing choose karo
4. **Ruled Paper Choose Karo**: Standard CBSE notebook format
5. **PDF Export Karo**: Print-ready 300 DPI PDF

### Pro Tips for CBSE Students:
- Important points ko **red ink** mein likho
- Diagram ke liye **graph paper** use karo
- Revision notes ke liye **flashcard generator** use karo
- Previous year questions ke liye **quiz generator** try karo

### Free hai kya?
Haan! Basic features bilkul free hain. Unlimited pages ke liye Student Pro plan ₹99/month — ek chai se sasta!

**Start free: https://niknote.online** ✨`,
  },
  {
    slug: 'handwriting-styles-for-assignments',
    title: 'Best Handwriting Styles for School & College Assignments — 2026 Guide',
    excerpt: '16+ handwriting styles for Indian students. Which style to use for school assignments, college projects, and exam notes.',
    category: 'Guide',
    readTime: '5 min',
    date: '2026-06-26',
    tags: ['handwriting styles', 'assignments', 'school', 'college'],
    content: `## Best Handwriting Styles for Assignments ✍️

Har assignment ke liye alag style chahiye — school notes ka alag, college project ka alag. NikNote mein 16+ styles hain!

### School Assignments (Class 5-12):
- **Neat Cursive** — Best for: English notes, essays
- **Standard Print** — Best for: Math solutions, science diagrams
- **Student Quick** — Best for: Rough notes, homework

### College Projects:
- **Professional Serif** — Best for: Research papers, thesis
- **Clean Sans** — Best for: Presentations, reports
- **Artistic Italic** — Best for: Creative projects

### Exam Notes:
- **Teacher Style** — Bold, clear, readable from distance
- **Compact Print** — Zyada content, kam space
- **Neat Cursive** — Classic exam copy look

### Tips:
1. Ink color: Blue for body, Black for headings, Red for important points
2. Paper: Ruled for notes, Graph for math/diagrams
3. Font size: 12-14pt for normal, 16-18pt for headings

**Try all styles free: https://niknote.online** 🎨`,
  },
  {
    slug: 'jee-neet-preparation-ai-tool',
    title: 'JEE NEET Preparation AI Tool Free — Smart Study with NikNote',
    excerpt: 'Free AI tool for JEE and NEET preparation. Quiz generator, flashcards, mind maps, AI teacher in Hindi. Better than coaching!',
    category: 'Exam Prep',
    readTime: '7 min',
    date: '2026-06-25',
    tags: ['JEE', 'NEET', 'AI tool', 'preparation', 'free'],
    content: `## JEE/NEET Preparation AI Tool — Free! 🎯

Coaching fees ₹50,000+? NikNote free mein AI Teacher, Quiz Generator, aur Flashcards deta hai!

### NikNote for JEE:
- **Physics**: Mechanics, Thermodynamics, Electrodynamics — Hindi mein samjhao
- **Chemistry**: Organic, Inorganic, Physical — quiz practice
- **Mathematics**: Calculus, Algebra, Coordinate Geometry — flashcards

### NikNote for NEET:
- **Biology**: Cell Biology, Genetics, Ecology — mind maps
- **Chemistry**: Same as JEE
- **Physics**: NEET-level explanations + quiz

### How to Use for Exam Prep:
1. **Daily Quiz**: 10 questions per topic, instant feedback
2. **Flashcard Revision**: Difficult topics ke flashcards banao
3. **Handwritten Notes**: Coaching notes ko revise karo — handwriting style mein
4. **Mind Maps**: Complex topics ko visually samjho

### Free vs Premium:
- Free: Basic quiz, 28+ AI subjects, limited pages
- Student Pro (₹99/mo): Unlimited quiz, advanced AI, no watermark, mind maps

**Start JEE/NEET prep free: https://niknote.online** 🚀`,
  },
];

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const handleShare = (post: BlogPost) => {
    const msg = encodeURIComponent(`${post.title}\n\n${post.excerpt}\n\nRead more: https://niknote.online/blog/${post.slug}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
    trackShare('whatsapp');
  };

  // Single post view
  if (selectedPost) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => setSelectedPost(null)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Button>
          </div>
        </header>
        <article className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">{selectedPost.category}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{selectedPost.readTime}</span>
              <span className="text-xs text-muted-foreground">{selectedPost.date}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{selectedPost.title}</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleShare(selectedPost)} className="gap-1 text-green-600 border-green-200">
                <MessageCircle className="w-3 h-3" /> Share on WhatsApp
              </Button>
            </div>
          </div>
          <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed whitespace-pre-line">
            {selectedPost.content}
          </div>
          <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10">
            <p className="text-center font-semibold text-foreground mb-3">Try NikNote Free! 🎓</p>
            <div className="flex justify-center">
              <Button onClick={() => navigate('/')} className="rounded-full bg-gradient-to-r from-primary to-blue-600">
                Start Writing Now ✨
              </Button>
            </div>
          </div>
        </article>
      </div>
    );
  }

  // Blog list
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to NikNote
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-bold text-foreground">NikNote Blog</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Study Tips, Tutorials & Guides 📚
          </h1>
          <p className="text-muted-foreground">
            Indian students ke liye helpful articles — Hindi + English mein!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                    {post.category}
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />{post.readTime}
                  </span>
                </div>
                <h2 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
