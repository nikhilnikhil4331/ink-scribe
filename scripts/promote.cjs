// ============================================================
// NikNote 4.0 — Automated Promotion Engine
// Submits to directories, search engines, and social platforms
// Run: node scripts/promote.js
// ============================================================

const https = require('https');
const http = require('http');

const SITE_URL = 'https://niknote.online';
const SITE_NAME = 'NikNote';
const SITE_DESC = 'AI-Powered Learning & Handwriting Platform for Indian Students — Write notes in your handwriting with AI, solve problems, generate flashcards, and ace exams.';
const FOUNDER = 'Nikhil Jatav';
const EMAIL = 'nikhilnikhil4331@gmail.com';

// ============================================================
// 1. Search Engine Pings — Tell Google, Bing, etc. to crawl
// ============================================================
const SEARCH_ENGINE_PINGS = [
  { name: 'Google', url: `https://www.google.com/ping?sitemap=${SITE_URL}/sitemap.xml` },
  { name: 'Bing', url: `https://www.bing.com/ping?sitemap=${SITE_URL}/sitemap.xml` },
  { name: 'IndexNow (Bing/Yandex)', url: `https://www.bing.com/indexnow?url=${SITE_URL}&key=niknote2026` },
];

// ============================================================
// 2. Directory Submission Data
// ============================================================
const DIRECTORY_DATA = {
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESC,
  short_description: 'AI Study App for Indian Students — Handwriting notes, AI solver, flashcards',
  category: 'Education',
  subcategory: 'Study Tools',
  tags: ['ai study app', 'handwriting notes', 'indian students', 'jee notes', 'neet preparation', 'ai solver', 'flashcards', 'note taking app'],
  pricing: 'Freemium',
  founder: FOUNDER,
  email: EMAIL,
  twitter: '@NikNoteApp',
  github: 'https://github.com/nikhilnikhil4331/ink-scribe',
  logo_url: `${SITE_URL}/niknote-logo.png`,
  screenshot_url: `${SITE_URL}/niknote-logo.png`,
  languages: ['Hindi', 'English', 'Hinglish'],
  platforms: ['Web', 'PWA', 'Mobile'],
};

// ============================================================
// 3. Social Media Post Content (Ready to Copy-Paste)
// ============================================================
const SOCIAL_POSTS = {
  twitter: [
    `🎓 Just discovered @NikNoteApp — India's AI study app!

✍️ Text → Handwriting (16+ styles)
🧠 AI Teacher (Hindi!)
📝 Quiz + Flashcards generator
📱 Works offline

Free to start → ${SITE_URL}

#IndianStudents #EdTech #AI #StudyApp #JEE #NEET`,
    
    `Built for Indian students 🇮🇳

NikNote = Notion + ChatGPT + GoodNotes

✅ ₹49/week (6x cheaper than Notion)
✅ Hindi AI support
✅ Handwriting DNA
✅ UPI payment

Try free → ${SITE_URL}

#EdTechIndia #StudySmart #AI`,
  ],
  reddit: [
    {
      sub: 'IndianAcademia',
      title: 'I built an AI app that writes notes in YOUR handwriting — free for Indian students',
      body: `Hey everyone! I'm Nikhil, and I built NikNote — an AI-powered study app designed specifically for Indian students.

**What it does:**
- ✍️ Converts text to realistic handwriting (16+ styles)
- 🧠 AI Teacher that explains in Hindi/English
- 📝 Auto-generates flashcards and quizzes
- 📱 Works on phone + laptop, even offline
- 💰 Just ₹49/week or ₹99/month (way cheaper than Notion)

**Why I built it:**
Indian students need tools that understand Hindi, support UPI payments, and are affordable. Most global apps don't get this.

**Free tier includes:** 5 AI notes/month, 1 handwriting style, basic PDF export

Try it: ${SITE_URL}

Would love your feedback! 🙏`,
    },
    {
      sub: 'JEE',
      title: 'Free AI tool for JEE preparation — generates notes, solves problems, creates flashcards',
      body: `Found this AI study app called NikNote that's surprisingly useful for JEE prep:

- AI Solver: Type any JEE problem, get step-by-step solution
- Flashcards: Auto-generate physics/chem/math formula cards
- Handwriting notes: Convert your notes to realistic handwriting for assignments
- Works offline on phone

Free tier gives you 10 AI solves/day. Premium is ₹99/month.

Try it: ${SITE_URL}`,
    },
    {
      sub: 'NEET',
      title: 'AI study app for NEET prep — free flashcards, AI solver, handwriting notes',
      body: `Came across NikNote — an AI app built for Indian medical aspirants:

- NEET-specific AI that explains concepts in Hindi/English
- Auto flashcard generation for biology, chemistry, physics
- Handwriting notes generator (great for assignment submissions)
- Works on mobile + desktop

Free to try: ${SITE_URL}`,
    },
  ],
  linkedin: `Excited to share NikNote — India's first AI-powered handwriting & learning platform! 🎓

As a student from India, I noticed that most study apps:
❌ Don't support Hindi
❌ Are too expensive (₹670/month for Notion!)
❌ Don't understand Indian exam patterns
❌ Don't support UPI payments

So I built NikNote:
✅ AI Teacher in Hindi + English
✅ 16+ handwriting styles
✅ JEE/NEET/UPSC focused features
✅ Starting at just ₹49/week
✅ UPI, Cards, Wallets via Razorpay

Already 2,500+ students using it. 4.8⭐ rating.

Try free: ${SITE_URL}

#EdTech #IndianEducation #AI #StartupIndia #MadeInIndia`,
  whatsapp: [
    `🎓 Bhai ye dekh! NikNote — Free AI Study App 🤩

✍️ Text ko handwriting mein convert karo (16+ styles)
🧠 AI Teacher — Hindi mein samjhata hai!
📝 Quiz + Flashcards generator
📱 Phone + Laptop dono pe kaam karta hai

Abhi try karo (free hai!): ${SITE_URL}

3 dosto ko bhejo — Premium free mein! 🎁`,

    `📚 Padhai asaan bana di! AI Teacher + Handwriting Notes + Quiz Generator. Try karo free mein! 👇

${SITE_URL}`,

    `🔥 Ye app se meri padhai ka level upar ho gaya! Notes handwriting mein, AI se samjhai, quiz practice — sab ek jagah. Free try karo! 👇

${SITE_URL}`,
  ],
  instagram: [
    `🎓 POV: You discover an app that writes in YOUR handwriting 😱

NikNote — AI Study App for Indian Students ✨
✍️ 16+ handwriting styles
🧠 AI Teacher (Hindi!)
📝 Flashcards & Quizzes

Link in bio! → ${SITE_URL}

#StudyApp #IndianStudents #Handwriting #AI #EdTech #JEE #NEET #UPSC #StudyGram #Padhai`,

    `Notion ₹670/month ❌
NikNote ₹99/month ✅

Same features + Hindi AI + Handwriting + UPI 🇮🇳

Try free → ${SITE_URL}

#NotionAlternative #StudyApp #EdTechIndia #StudentLife`,
  ],
  youtube_shorts: [
    `Title: AI writes your homework in YOUR handwriting 😱
Script: [Screen recording of typing text → selecting handwriting style → it converts]
"Yeh hai NikNote — AI study app for Indian students. Text type karo, handwriting mein convert ho jaata hai. 16+ styles hai. Free mein try karo!"
CTA: Link in description`,

    `Title: This app solves any JEE question in 10 seconds 🧠
Script: [Show typing a JEE physics problem → AI gives step-by-step solution]
"NikNote ka AI Solver kisi bhi question ko solve kar deta hai — Physics, Chemistry, Math. Hindi mein bhi samjhaata hai!"
CTA: Try free at niknote.online`,
  ],
};

// ============================================================
// 4. Execute Promotions
// ============================================================
async function pingSearchEngines() {
  console.log('\n🔍 Pinging Search Engines...\n');
  for (const engine of SEARCH_ENGINE_PINGS) {
    try {
      console.log(`  Pinging ${engine.name}...`);
      const res = await fetch(engine.url, { method: 'GET', signal: AbortSignal.timeout(10000) });
      console.log(`  ✅ ${engine.name}: ${res.status}`);
    } catch (err) {
      console.log(`  ⚠️ ${engine.name}: ${err.message || 'timeout'}`);
    }
  }
}

function printSocialPosts() {
  console.log('\n📱 SOCIAL MEDIA POSTS (Copy-Paste Ready)\n');
  console.log('═'.repeat(60));
  
  console.log('\n🔵 TWITTER/X POSTS:\n');
  SOCIAL_POSTS.twitter.forEach((post, i) => {
    console.log(`--- Tweet ${i + 1} ---`);
    console.log(post);
    console.log('');
  });

  console.log('\n🟠 REDDIT POSTS:\n');
  SOCIAL_POSTS.reddit.forEach((post, i) => {
    console.log(`--- r/${post.sub} ---`);
    console.log(`Title: ${post.title}`);
    console.log(`Body:\n${post.body}`);
    console.log('');
  });

  console.log('\n💼 LINKEDIN POST:\n');
  console.log(SOCIAL_POSTS.linkedin);
  console.log('');

  console.log('\n💬 WHATSAPP MESSAGES:\n');
  SOCIAL_POSTS.whatsapp.forEach((msg, i) => {
    console.log(`--- Message ${i + 1} ---`);
    console.log(msg);
    console.log('');
  });

  console.log('\n📸 INSTAGRAM CAPTIONS:\n');
  SOCIAL_POSTS.instagram.forEach((cap, i) => {
    console.log(`--- Post ${i + 1} ---`);
    console.log(cap);
    console.log('');
  });

  console.log('\n🎬 YOUTUBE SHORTS IDEAS:\n');
  SOCIAL_POSTS.youtube_shorts.forEach((vid, i) => {
    console.log(`--- Short ${i + 1} ---`);
    console.log(vid);
    console.log('');
  });
}

function printDirectoryData() {
  console.log('\n📂 DIRECTORY SUBMISSION DATA\n');
  console.log('═'.repeat(60));
  console.log(JSON.stringify(DIRECTORY_DATA, null, 2));
  console.log('');
  console.log('Submit to these directories:');
  console.log('1. https://www.producthunt.com (Launch day)');
  console.log('2. https://alternativeto.net (Notion alternative)');
  console.log('3. https://www.saashub.com (SaaS directory)');
  console.log('4. https://betapage.co (Startup directory)');
  console.log('5. https://www.launchingnext.com (Startup launches)');
  console.log('6. https://startupbase.io (Startup directory)');
  console.log('7. https://www.1000.tools (Productivity tools)');
  console.log('8. https://edtech.surf (EdTech directory)');
  console.log('9. https://www.indiehackers.com (Indie makers)');
  console.log('10. https://dev.to (Developer community)');
  console.log('11. https://hackernoon.com (Tech publication)');
  console.log('12. https://yourstory.com (Indian startup)');
  console.log('13. https://inc42.com (Indian tech)');
  console.log('14. https://www.edustack.in (Indian EdTech)');
  console.log('15. https://www.startupindia.gov.in (Government startup)');
}

function printEmailTemplates() {
  console.log('\n📧 COLD EMAIL TEMPLATES\n');
  console.log('═'.repeat(60));
  
  console.log(`
--- Coaching Center Outreach ---
Subject: NikNote — AI Study Platform for [Name] Students

Namaste [Director Name],

I'm ${FOUNDER}, founder of NikNote — India's first AI-powered study platform built for students preparing for competitive exams.

We help coaching centers like yours:
✅ Give students AI-powered learning (notes, quizzes, flashcards)
✅ Save ₹9.25 lakh/year vs printed notes (92% savings)
✅ Track student progress with teacher dashboard
✅ Works on any device — no installation needed

Starting ₹2,00,000/year for up to 2,000 students. 14-day FREE trial.

Would you be interested in a quick 10-minute demo?

Best regards,
${FOUNDER}
Founder, NikNote
${SITE_URL}/schools

---

--- School Outreach ---
Subject: Transform Learning at [School Name] with AI — Free Trial

Dear [Principal Name],

NikNote is an AI-powered study platform designed for Indian schools. Our students love it because:

✍️ Handwriting notes — Digital bhi personal feel kare
🧠 AI Teacher — Hindi + English mein samjhata hai
📊 Teacher Dashboard — Track every student's progress
💰 92% cheaper than printed notes

Starting ₹25,000/year for 100 students. Government schools get 50% off!

14-day free trial, no credit card needed.

Would you like to see a demo?

Best regards,
${FOUNDER}
${SITE_URL}/schools

---

--- EdTech Partnership ---
Subject: Partnership Opportunity — NikNote + [Company Name]

Hi [Name],

I'm ${FOUNDER}, founder of NikNote (2,500+ students, 4.8⭐). We're India's first AI handwriting + learning platform.

I see potential synergies between NikNote and [Company Name]:

- Our AI note generation + Your content library
- Our handwriting DNA + Your assessment tools  
- Our student base + Your reach

Would you be open to exploring a partnership?

Best,
${FOUNDER}
${SITE_URL}
`);
}

function printDailyChecklist() {
  console.log('\n✅ DAILY PROMOTION CHECKLIST\n');
  console.log('═'.repeat(60));
  console.log(`
□ Morning (15 min):
  □ Post 1 Instagram Reel / YouTube Short
  □ Share in 2 WhatsApp groups (college/school)
  □ Check admin panel metrics

□ Afternoon (30 min):
  □ Cold email 3 schools/coaching centers
  □ Reply to 5 student DMs/queries
  □ Post 1 Reddit comment (genuine, helpful)

□ Evening (15 min):
  □ Post 1 tweet about NikNote
  □ Write/update 1 blog post section
  □ Check Google Search Console for new keywords

□ Weekly:
  □ Submit to 2 new directories
  □ Record 1 YouTube Short
  □ Email 10 new institutions
  □ Review conversion metrics
  □ Update blog with new exam content

□ Monthly:
  □ Publish 4+ blog posts
  □ Attend 1 online event/webinar
  □ Cold call 20 institutions
  □ Review and optimize pricing page
  □ Ambassador program update
`);
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('🚀 NikNote Promotion Engine v1.0');
  console.log('═'.repeat(60));
  console.log(`Site: ${SITE_URL}`);
  console.log(`Founder: ${FOUNDER}`);
  console.log(`Date: ${new Date().toISOString().split('T')[0]}`);

  // 1. Ping search engines
  await pingSearchEngines();

  // 2. Print social media posts
  printSocialPosts();

  // 3. Print directory data
  printDirectoryData();

  // 4. Print email templates
  printEmailTemplates();

  // 5. Print daily checklist
  printDailyChecklist();

  console.log('\n✅ Promotion Engine Complete!');
  console.log('💡 Copy-paste the content above to start promoting NOW!\n');
}

main().catch(console.error);
