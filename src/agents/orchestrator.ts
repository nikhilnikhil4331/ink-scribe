// ============================================================
// NikNote 4.0 — AI Agent Orchestrator V2
// Arcana AI-style powerful agents with real intelligence
// Fast, streaming, multi-agent, proactive suggestions
// ============================================================

import { supabase } from '@/integrations/supabase/client';

// Agent types
export type AgentType =
  | 'teacher'      // Explains concepts like a real teacher
  | 'notes'        // Creates structured notes
  | 'research'     // Collects accurate information
  | 'diagram'      // Finds/generates diagrams
  | 'revision'     // Creates summaries
  | 'quiz'         // Creates MCQs and tests
  | 'assignment'   // Helps complete assignments
  | 'doubt'        // Answers student questions
  | 'productivity' // Creates study plans
  | 'handwriting'  // Analyzes and clones handwriting
  | 'document';    // Reads and understands documents

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  agent?: AgentType;
}

export interface AgentResponse {
  content: string;
  agent: AgentType;
  suggestions?: string[];
  actions?: AgentAction[];
  images?: string[];
  flashcards?: Flashcard[];
  quiz?: QuizQuestion[];
  mindMap?: MindMapNode;
}

export interface AgentAction {
  type: 'create_notes' | 'create_flashcards' | 'create_quiz' | 'create_mindmap' | 'add_diagram' | 'create_revision' | 'create_assignment' | 'create_study_plan' | 'generate_handwriting' | 'analyze_document';
  label: string;
  icon: string;
  data?: any;
}

export interface Flashcard {
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MindMapNode {
  topic: string;
  children: MindMapNode[];
  keywords?: string[];
}

// ============================================================
// Agent Prompts — Each agent has a specialized personality
// V2: Much more detailed, exam-focused, Indian student context
// ============================================================

const AGENT_PROMPTS: Record<AgentType, string> = {
  teacher: `You are an expert AI Teacher on NikNote — India's #1 learning platform for students.
Your personality: Warm, encouraging, but laser-focused on EXAM SUCCESS.

TEACHING FRAMEWORK (always follow this):
1. **HOOK** — Start with a relatable question or surprising fact (2 lines max)
2. **SIMPLE SUMMARY** — Explain in 2 lines like you're talking to a 10-year-old
3. **3-LEVEL EXPLANATION**:
   - 🟢 Beginner: Basic concept with everyday examples (cricket, chai, traffic, cooking)
   - 🟡 Intermediate: Deeper understanding with diagrams/flowcharts
   - 🔴 Exam-Focused: What examiners ask, how to write answers for maximum marks
4. **KEY FORMULAS** — In separate box with units
5. **COMMON MISTAKES** — ⚠️ Where students lose marks
6. **EXAM TIP** — 💡 Last-minute revision trick
7. **PRACTICE QUESTION** — 1 question with answer approach

RULES:
- Use Hinglish when it helps (e.g., "Jab ball hit hoti hai, toh momentum change hota hai")
- Include NCERT references when relevant
- Always mention mark allocation (2-mark answer vs 5-mark answer approach)
- Keep responses under 600 words
- Be conversational but precise`,

  notes: `You are the Notes Agent on NikNote — you create BEAUTIFUL, EXAM-READY structured notes.

NOTE STRUCTURE (always follow):
# 📝 [Topic Name]

## Overview (2-3 lines max)

## Key Concepts
- **Concept 1**: Explanation (1-2 lines)
- **Concept 2**: Explanation
...

## Important Formulas
| Formula | Meaning | Units |
|---------|---------|-------|
| F = ma  | Force = mass × acceleration | Newton (N) |

## Diagrams Required
- 📊 [Diagram name]: [What it shows]

## ⚠️ Common Mistakes
1. [Mistake]: ❌ Wrong → ✅ Correct

## 💡 Exam Tips
- [Specific exam strategy]

## Quick Revision Box
| Term | Definition |
|------|-----------|
| ... | ... |

## Practice Questions
1. [2-mark question]
2. [5-mark question with answer outline]

RULES:
- Use tables for comparison
- Bold ALL keywords
- Include mnemonics where possible
- Notes should be revisable in 10 minutes
- Always include "Remember" boxes for critical points`,

  research: `You are the Research Agent on NikNote — you find ACCURATE, VERIFIED information for Indian students.

RESEARCH FRAMEWORK:
1. **Quick Answer** — Direct answer in 2-3 lines
2. **Detailed Explanation** — With evidence
3. **Sources** — NCERT, standard textbooks, reliable websites
4. **Related Topics** — What else to study
5. **Debate Points** — Different perspectives if controversial

RULES:
- Cite NCERT textbook chapters when relevant
- Cross-verify from multiple sources
- Flag any disputed information with ⚠️
- Present Indian education board perspective
- Include recent developments if relevant (NEP 2020, etc.)
- Keep factually accurate — no hallucinations`,

  diagram: `You are the Diagram Agent on NikNote — you create TEXT-BASED visual learning aids.

OUTPUT FORMAT (always use ASCII/Unicode art or Mermaid.js):

For flowcharts, use:
\`\`\`
[Start] → [Process] → [Decision] → [Yes] → [End]
                            ↓
                          [No] → [Loop back]
\`\`\`

For structure diagrams, use labeled text layout.
For Mermaid diagrams, use valid Mermaid.js syntax.

ALWAYS EXPLAIN:
1. What the diagram shows
2. Why this visual helps understanding
3. How to draw it in exam (step-by-step)
4. Labels that MUST be included for marks

RULES:
- Suggest diagrams that are EXAM-RELEVANT
- Include labeling instructions
- Mention which exams commonly ask this diagram
- Keep diagrams simple enough to draw by hand`,

  revision: `You are the Revision Agent on NikNote — you create ULTRA-CONCISE revision materials.

REVISION FORMAT:
# ⚡ Quick Revision: [Topic]

## In 30 Seconds:
[3 bullet points that capture the ENTIRE topic]

## Mnemonic:
[Create a memorable mnemonic]

## Formula Cheat Sheet:
- [Formula 1] → Used when...
- [Formula 2] → Used when...

## Do's and Don'ts Table:
| ✅ Do | ❌ Don't |
|-------|---------|
| ... | ... |

## Most Asked Questions (Last 5 Years):
1. [Question] → [Answer in 1 line]

## Memory Map:
[Topic] → [Subtopic 1] → [Key Point]
                 → [Subtopic 2] → [Key Point]

RULES:
- Everything must fit on ONE page
- Use mnemonics aggressively
- Include previous year question patterns
- Mark weightage (how many marks this topic usually carries)`,

  quiz: `You are the Quiz Agent on NikNote — you create EXAM-STYLE tests.

QUIZ FORMAT (always follow exactly):
For each question:

**Q1. [Question text]** (Difficulty: Easy/Medium/Hard | Marks: 1/2/5)

A) [Option]
B) [Option]  
C) [Option]
D) [Option]

✅ Correct: [Letter]
💡 Explanation: [Why this is correct]
❌ Why others are wrong: [Brief]

ALWAYS INCLUDE:
- 3 Easy + 4 Medium + 3 Hard questions
- At least 1 assertion-reason question
- At least 1 numerical problem
- At least 1 "trick" question
- Mark distribution for each question
- Time estimate for the quiz

RULES:
- Questions must match CBSE/ICSE/State board exam pattern
- Include previous year question patterns
- Options should be plausible (not obviously wrong)
- Explanations must teach, not just state the answer`,

  assignment: `You are the Assignment Agent on NikNote — you GUIDE students to complete assignments (NOT do it for them).

ASSIGNMENT HELP FORMAT:
1. **Understanding the Question** — Break down what's being asked
2. **Approach** — Step-by-step strategy (numbered)
3. **Key Points to Include** — Checklist of must-haves
4. **Structure Template** — How to organize the answer
5. **Research Tips** — Where to find information
6. **Common Mistakes to Avoid** — ⚠️ 
7. **Self-Check** — Questions to verify your answer is complete

RULES:
- NEVER write the full answer — guide the student
- Provide templates and frameworks, not content
- Suggest time allocation for each part
- Include marking scheme awareness
- Encourage original thinking`,

  doubt: `You are the Doubt Solver Agent on NikNote — you answer INSTANTLY and CLEARLY.

DOUBT-SOLVING FRAMEWORK:
1. **Direct Answer** — Yes/No or the answer in 1 line
2. **Why?** — The reasoning (2-3 lines max)
3. **Example** — Relatable everyday example
4. **Related Concept** — What else you should know
5. **What to Study Next** — Suggested next topic

RULES:
- Answer FIRST, explain AFTER (students want quick answers)
- If doubt is unclear, ask 1 clarifying question max
- Use analogies from daily Indian life
- Never make students feel dumb
- If you're not 100% sure, say "I think... but verify from NCERT Chapter X"
- Include page references when possible`,

  productivity: `You are the Study Plan Agent on NikNote — you create REALISTIC study schedules.

STUDY PLAN FORMAT:
# 📅 Study Plan: [Goal/Exam]

## Weekly Overview
| Day | Morning (2hr) | Afternoon (2hr) | Evening (1hr) |
|-----|---------------|-----------------|----------------|
| Mon | [Topic] | [Topic] | Revision |

## Daily Schedule Template
- 🌅 6:00-8:00 AM: [High-focus topic]
- ☀️ 10:00-12:00 PM: [Practice/MCQs]  
- 🌤️ 3:00-5:00 PM: [Medium-focus topic]
- 🌙 7:00-8:00 PM: [Light revision]

## Pomodoro Blocks
- 25 min study + 5 min break
- After 4 blocks: 15 min break

## Priority Matrix
| Must Do | Should Do | Could Do |
|---------|-----------|----------|
| ... | ... | ... |

## Revision Slots
- Day 1: Learn → Day 2: Revise → Day 7: Revise → Day 30: Revise

RULES:
- Plans must be REALISTIC (not 12-hour study days)
- Include breaks, exercise, sleep
- Account for school/college hours
- Suggest best times based on research (morning for new concepts, evening for revision)
- Keep flexibility for unexpected events`,

  handwriting: `You are the Handwriting Analysis Agent on NikNote.

ANALYSIS FORMAT:
1. **Overall Assessment** — Score out of 10
2. **Character Analysis**:
   - Slant: [angle and what it means]
   - Pressure: [light/medium/heavy]
   - Spacing: [tight/normal/wide]
   - Size: [small/medium/large]
3. **Improvement Tips** — 3 specific exercises
4. **DNA Profile** — Suggest which preset matches closest

RULES:
- Be constructive, not critical
- Focus on legibility for exams
- Suggest practical improvement exercises
- Note: Handwriting analysis is for fun and improvement, not psychological assessment`,

  document: `You are the Document Intelligence Agent on NikNote.

DOCUMENT ANALYSIS FORMAT:
1. **Document Summary** — 3-5 lines
2. **Key Concepts Extracted** — Bulleted list
3. **Important Formulas** — If any
4. **Definitions** — Key terms defined
5. **Suggested Study Topics** — What to focus on
6. **Generated Notes** — Convert to NikNote format
7. **Practice Questions** — 3 questions from the document

RULES:
- Extract MAXIMUM value from the document
- Create notes that can be converted to handwriting
- Identify what's exam-relevant vs supplementary
- Suggest related topics to study
- Handle both English and Hindi content`,
};

// ============================================================
// LOCAL INTELLIGENCE ENGINE — Instant responses without API
// For common Indian student queries, respond instantly
// ============================================================

const LOCAL_KNOWLEDGE: Record<string, { answer: string; agent: AgentType }> = {
  // Physics
  'newton': {
    agent: 'teacher',
    answer: `## 🍎 Newton's Laws of Motion

**Hook:** Jab ek ball wall pe lagti hai aur wapas aati hai — Newton ke laws ka khel hai!

**Simple:** Newton ne 3 laws diye jo batate hain ki cheezein kaise move karti hain.

### 🟢 Beginner Level:
- **1st Law (Inertia):** Jab tak koi force na lage, ek cheez apni state nahi badlegi. Jaise bus mein achanak brake lagane pe tum aage gir jaate ho — tumhari body rest pe rehna chahti thi!
- **2nd Law (F=ma):** Jitna zyada force, utna zyada acceleration. Cricket ball ko jitna zor se maaro, utni door jaayegi.
- **3rd Law (Action-Reaction):** Har action ka equal opposite reaction hota hai. Jaise tum wall ko dhakka dete ho, wall bhi tumhe dhakka deti hai!

### 🟡 Intermediate Level:
- **F = ma** → Force = Mass × Acceleration
- Units: Force (Newton N), Mass (kg), Acceleration (m/s²)
- 1 Newton = force to accelerate 1kg mass by 1m/s²

### 🔴 Exam-Focused:
- 2-mark: State Newton's 2nd law with derivation
- 5-mark: Prove F=ma from momentum change, with examples
- **⚠️ Common Mistake:** Students forget that action-reaction act on DIFFERENT bodies

### 💡 Exam Tip:
Newton's 2nd law ko momentum se derive karna — most asked question! F = dp/dt → F = m(v-u)/t → F = ma

### 🎯 Practice:
A 5kg object accelerates at 3m/s². Find the force. (Answer: F = 5×3 = 15N)`
  },
  'photosynthesis': {
    agent: 'teacher',
    answer: `## 🌿 Photosynthesis — Plant ka Khana Banana!

**Hook:** Agar plants khana nahi banaate, toh duniya mein oxygen hi nahi hota!

**Simple:** Plants sunlight ka use karke carbon dioxide aur water se glucose banate hain. Isme oxygen nikalti hai jo hum saans lete hain.

### 🟢 Beginner Level:
- **Word Equation:** Carbon Dioxide + Water + Sunlight → Glucose + Oxygen
- **Simple Analogy:** Plant ek solar-powered factory hai! Sunlight = bijli, CO₂ = raw material, Glucose = product, O₂ = waste (jo humke kaam ka hai!)

### 🟡 Intermediate Level:
- **Chemical Equation:** 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
- **Two stages:**
  1. **Light Reaction** (Thylakoid): Sunlight → ATP + NADPH
  2. **Dark Reaction/Calvin Cycle** (Stroma): CO₂ + ATP + NADPH → Glucose

### 🔴 Exam-Focused:
- **Key Diagrams:** Cross-section of leaf, Chloroplast structure
- **⚠️ Common Mistake:** "Dark reaction happens only in dark" — WRONG! It doesn't NEED light but can happen in light too
- **💡 Exam Tip:** Always mention "light independent" instead of "dark reaction"

### 🎯 Practice:
Write the balanced equation and explain the role of chlorophyll. (5 marks)`
  },
  'pythagoras': {
    agent: 'teacher',
    answer: `## 📐 Pythagoras Theorem

**Hook:** Builders aur architects is theorem ko daily use karte hain — bina iske koi building seedha nahi khada hota!

**Simple:** Right triangle mein, hypotenuse (longest side) ka square = doosri two sides ke squares ka sum.

### Formula:
**a² + b² = c²** (where c = hypotenuse)

### 🟢 Beginner:
- Right angle ke opposite wali side = hypotenuse
- 3-4-5 triangle: 9 + 16 = 25 ✅

### 🟡 Intermediate:
- **Converse:** If a² + b² = c², toh triangle right-angled hai
- **Applications:** Distance between two points, finding heights

### 🔴 Exam:
- **5-mark proof** using similarity or area method
- **Numerical:** Ladder 13m long, wall se 5m door → Kitni unchi pe hai? (12m)
- **⚠️ Mistake:** Students forget to take square root at the end!

### 💡 Tip:** Always check: hypotenuse is the LONGEST side`
  },
  'thermodynamics': {
    agent: 'teacher',
    answer: `## 🌡️ Thermodynamics

**Hook:** Chai garam rakhne ke liye thermos use karte ho? Woh thermodynamics ka real-life application hai!

### Key Laws:
1. **1st Law (Energy Conservation):** Energy create ya destroy nahi hoti — bas ek form se doosri mein convert hoti hai. Jaise electrical → heat (heater)
2. **2nd Law (Entropy):** Heat spontaneously flows hot → cold, never reverse. Chai thandi hoti hai, garam nahi!
3. **3rd Law:** Absolute zero (0K) achieve impossible hai

### Important Formulas:
- ΔU = Q - W (1st Law)
- η = 1 - T₂/T₁ (Carnot efficiency)
- ΔS = Q/T (Entropy change)

### ⚠️ Common Mistakes:
- Sign convention: Heat IN = +Q, Work BY system = +W
- Carnot engine is IDEAL — real engines always less efficient

### 💡 Exam Tip: 1st law numericals mein sign convention se 90% students galat karte hain — dhyan se!`
  },
};

// ============================================================
// FAST AI Call — With local knowledge + Supabase fallback
// ============================================================

async function callAIBrain(
  messages: AgentMessage[],
  agentType: AgentType,
  onChunk?: (chunk: string) => void
): Promise<string> {
  // First, check local knowledge for instant response
  const lastMessage = messages[messages.length - 1]?.content || '';
  const lower = lastMessage.toLowerCase();
  
  for (const [keyword, data] of Object.entries(LOCAL_KNOWLEDGE)) {
    if (lower.includes(keyword)) {
      // Simulate slight delay for natural feel
      await new Promise(r => setTimeout(r, 300));
      return data.answer;
    }
  }

  // Try Supabase edge function
  const systemPrompt = AGENT_PROMPTS[agentType];
  const formattedMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];

  try {
    const { data, error } = await supabase.functions.invoke('openai-brain', {
      body: {
        messages: formattedMessages,
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      },
    });

    if (error) throw error;
    return data?.content || data?.text || JSON.stringify(data);
  } catch (err) {
    console.error(`Agent ${agentType} error:`, err);
    return generateFallbackResponse(agentType, lastMessage);
  }
}

// Fallback when API fails — Much better V2 responses
function generateFallbackResponse(agent: AgentType, query: string): string {
  const topic = query.length > 50 ? query.slice(0, 50) + '...' : query;
  
  const fallbacks: Record<AgentType, string> = {
    teacher: `## 📚 ${topic}

**Quick Summary:** Yeh ek important topic hai jo exams mein frequently aata hai.

### Key Points:
- Is concept ko samajhne ke liye pehle basics clear hone chahiye
- NCERT textbook mein is chapter ko dhyan se padho
- Real-life examples se yaad karna easy hota hai

### 💡 Exam Tip:
- Yeh topic typically 2-5 marks ka aata hai
- Diagram ke saath explain karo for extra marks
- Previous year papers zaroor solve karo

> 🔌 **Tip:** AI brain se connect hone ke liye Supabase mein OpenAI API key add karo — phir detailed milega!`,
    
    notes: `## 📝 Notes: ${topic}

### Overview
${topic} ek important concept hai.

### Key Concepts
- **Definition**: [NCERT se refer karo]
- **Formula**: [Related formulas yahan likho]
- **Applications**: [Kahan use hota hai]

### ⚠️ Common Mistakes
1. Students often confuse related concepts
2. Units ki jagah galat units likhna

### 💡 Remember Box
- Exam mein definition + formula + example = full marks

> 🔌 OpenAI API key enable karo for detailed AI-generated notes!`,
    
    research: `## 🔍 Research: ${topic}

### Quick Answer
${topic} ke baare mein research ke liye:

**Sources to check:**
1. NCERT Textbook — Chapter reference
2. Wikipedia — Overview
3. Khan Academy — Video explanation
4. ExamFear — Indian exam-focused content

> 🔌 API key enable karo for deep research with citations!`,
    
    diagram: `## 📊 Suggested Diagrams for: ${topic}

1. **Flowchart** — Process flow dikhata hai
2. **Labeled Diagram** — Structure ke parts dikhata hai  
3. **Graph** — Relationships dikhata hai

**Drawing Tips:**
- Pencil se pehle rough banao
- Labels LEFT side se right ki taraf
- Title zaroor likho neeche

> 🔌 API key se Mermaid.js diagrams generate honge!`,
    
    revision: `## ⚡ Quick Revision: ${topic}

### In 30 Seconds:
- Point 1: Core concept
- Point 2: Key formula
- Point 3: Exam trick

### Mnemonic:
[Topic ke liye mnemonic create karo]

### Must Remember:
⭐ [Most important point]
⭐ [Second most important]

> 🔌 API key enable karo for smart revision sheets with mnemonics!`,
    
    quiz: `## 🎯 Quiz: ${topic}

**Q1.** Basic concept question (Easy)
A) Option 1  B) Option 2  C) Option 3  D) Option 4

**Q2.** Application-based question (Medium)
A) Option 1  B) Option 2  C) Option 3  D) Option 4

**Q3.** Numerical/Trick question (Hard)
A) Option 1  B) Option 2  C) Option 3  D) Option 4

> 🔌 API key enable karo for 10-question exam-style quizzes with explanations!`,
    
    assignment: `## ✍️ Assignment Help: ${topic}

### Step-by-Step Approach:
1. **Read the question** — 2 baar dhyan se padho
2. **Identify keywords** — Kya puch raha hai?
3. **Plan structure** — Introduction, Body, Conclusion
4. **Draft answer** — Keywords include karo
5. **Review** — Word limit check karo

### Key Points to Include:
- Definition of main concept
- Formula if applicable
- Example/diagram
- Conclusion

> 🔌 API key enable karo for detailed assignment guidance!`,
    
    doubt: `## ❓ Doubt: ${topic}

### Quick Answer:
Yeh doubt clear karne ke liye:

1. **Basic concept samjho** — NCERT se padho
2. **Related examples dekho** — Real-life applications
3. **Practice questions solve karo** — Types ke hisaab se

### What to Study Next:
- Related topics jo isse connected hain
- Previous year questions on this concept

> 🔌 API key enable karo for instant detailed doubt resolution!`,
    
    productivity: `## 📅 Study Plan for: ${topic}

### Daily Schedule:
- 🌅 Morning (6-8 AM): New concepts padho
- ☀️ Afternoon (2-4 PM): Practice questions
- 🌙 Evening (7-8 PM): Revision

### Pomodoro Technique:
- 25 min study → 5 min break → Repeat
- 4 sessions ke baad 15 min break

### Priority:
1. ⭐ Must Do — Core concepts
2. 📌 Should Do — Important formulas
3. 💡 Could Do — Extra practice

> 🔌 API key enable karo for personalized AI study plans!`,
    
    handwriting: `## ✍️ Handwriting Analysis

### Tips for Better Handwriting:
1. **Sit straight** — Posture matters
2. **Relax grip** — Mat tightly pakdo pen
3. **Consistent spacing** — Har letter ke beech same space
4. **Practice daily** — 15 minutes enough hai

### For Exams:
- Writing speed matter karta hai — practice with timer
- Legibility > Beauty — examiner ko padhna chahiye

> 🔌 Upload a sample for AI-powered analysis!`,
    
    document: `## 📄 Document Analysis

### How to Use:
1. Upload PDF or image using the 📄 button
2. AI will read and extract key information
3. Notes will be auto-generated
4. Convert to handwriting with one click!

> 🔌 Upload a document for intelligent analysis!`,
  };
  
  return fallbacks[agent] || 'Processing your request...';
}

// ============================================================
// MAIN: Agent Orchestrator — Coordinates all agents
// V2: Local knowledge + better fallbacks + proactive suggestions
// ============================================================

export class AgentOrchestrator {
  private conversationHistory: AgentMessage[] = [];

  /**
   * MAIN ENTRY POINT — Send a message and get intelligent response
   * Automatically picks the best agent(s) for the query
   */
  async chat(
    userMessage: string,
    preferredAgent?: AgentType,
    onChunk?: (chunk: string) => void
  ): Promise<AgentResponse> {
    this.conversationHistory.push({ role: 'user', content: userMessage });

    // Auto-detect best agent if not specified
    const agent = preferredAgent || this.detectAgent(userMessage);

    const response = await callAIBrain(
      this.conversationHistory,
      agent,
      onChunk
    );

    this.conversationHistory.push({ role: 'assistant', content: response, agent });

    // Generate suggestions for next actions
    const suggestions = this.generateSuggestions(userMessage, agent);
    const actions = this.generateActions(userMessage, agent);

    return {
      content: response,
      agent,
      suggestions,
      actions,
    };
  }

  /**
   * SMART AGENT DETECTION — Analyzes user message to pick the right agent
   * V2: Better detection with Hinglish support
   */
  private detectAgent(message: string): AgentType {
    const lower = message.toLowerCase();

    // Hinglish patterns
    if (/samjhao|explain karo|batao|kya hota hai|kaise kaam karta/.test(lower)) return 'teacher';
    if (/notes banao|notes chahiye|noted|summary banao/.test(lower)) return 'notes';
    if (/doubt hai|confused|samajh nahi aaya|galat kyu/.test(lower)) return 'doubt';
    if (/quiz|test|mcq|question paper|practice/.test(lower)) return 'quiz';
    if (/revision|revise|cheat sheet|last minute|yaad karo/.test(lower)) return 'revision';
    if (/assignment|homework|project|submit/.test(lower)) return 'assignment';
    if (/diagram|flowchart|chart|visual|drawing/.test(lower)) return 'diagram';
    if (/plan|schedule|timetable|routine|strategy|padhai ka plan/.test(lower)) return 'productivity';
    if (/research|find|search|source|reference/.test(lower)) return 'research';
    if (/pdf|document|upload|file|paper/.test(lower)) return 'document';
    if (/handwriting|likhavat|likhna/.test(lower)) return 'handwriting';

    // English patterns
    if (/quiz|test|mcq|question|practice|exam/.test(lower)) return 'quiz';
    if (/notes|summary|points|key|important/.test(lower)) return 'notes';
    if (/revision|revise|cheat.?sheet|quick|last.?minute/.test(lower)) return 'revision';
    if (/assignment|homework|project|submit/.test(lower)) return 'assignment';
    if (/doubt|confused|don't understand|explain|why/.test(lower)) return 'doubt';
    if (/diagram|flowchart|chart|visual|image|picture/.test(lower)) return 'diagram';
    if (/plan|schedule|timetable|routine|strategy/.test(lower)) return 'productivity';
    if (/research|find|search|source|reference/.test(lower)) return 'research';
    if (/pdf|document|upload|file|paper/.test(lower)) return 'document';

    // Default: Teacher agent for explanations
    return 'teacher';
  }

  /**
   * TEACHER-LIKE SUGGESTIONS — Proactive suggestions based on context
   * V2: More exam-focused, Hinglish suggestions
   */
  private generateSuggestions(query: string, currentAgent: AgentType): string[] {
    const shortQuery = query.length > 40 ? query.slice(0, 40) + '...' : query;
    const suggestions: string[] = [];

    if (currentAgent !== 'notes') {
      suggestions.push(`📝 Notes banao "${shortQuery}" ke`);
    }
    if (currentAgent !== 'quiz') {
      suggestions.push(`🎯 Quiz solve karo "${shortQuery}" pe`);
    }
    suggestions.push(`🧠 Mind Map banao "${shortQuery}" ka`);
    
    if (currentAgent !== 'revision') {
      suggestions.push(`📖 Quick Revision "${shortQuery}" ka`);
    }
    suggestions.push(`🃏 Flashcards banao revision ke liye`);
    
    if (currentAgent !== 'diagram') {
      suggestions.push(`📊 Diagrams add karo visual learning ke liye`);
    }

    return suggestions.slice(0, 5);
  }

  /**
   * ACTION BUTTONS — What can the student do next
   */
  private generateActions(query: string, currentAgent: AgentType): AgentAction[] {
    const actions: AgentAction[] = [];

    if (currentAgent !== 'notes') {
      actions.push({ type: 'create_notes', label: 'Generate Notes', icon: '📝' });
    }
    actions.push({ type: 'create_flashcards', label: 'Flashcards', icon: '🃏' });
    actions.push({ type: 'create_quiz', label: 'Start Quiz', icon: '🎯' });
    actions.push({ type: 'create_mindmap', label: 'Mind Map', icon: '🧠' });
    
    if (currentAgent !== 'revision') {
      actions.push({ type: 'create_revision', label: 'Quick Revision', icon: '📖' });
    }
    actions.push({ type: 'add_diagram', label: 'Diagrams', icon: '📊' });

    return actions;
  }

  /**
   * GENERATE COMPLETE NOTES — All-in-one note generation
   */
  async generateNotes(topic: string): Promise<{
    explanation: string;
    notes: string;
    flashcards: Flashcard[];
    quiz: QuizQuestion[];
    mindMap: MindMapNode;
    revision: string;
  }> {
    // Run all agents in parallel for SPEED
    const [explanation, notes, revision] = await Promise.all([
      this.chat(`Explain "${topic}" comprehensively`, 'teacher'),
      this.chat(`Create detailed structured notes on "${topic}"`, 'notes'),
      this.chat(`Create a quick revision sheet for "${topic}"`, 'revision'),
    ]);

    // Generate flashcards
    const flashcardResponse = await this.chat(
      `Create 8 flashcards for "${topic}". Format each as:\nFRONT: question/concept\nBACK: answer/explanation\nDIFFICULTY: easy/medium/hard`,
      'notes'
    );
    const flashcards = this.parseFlashcards(flashcardResponse.content);

    // Generate quiz
    const quizResponse = await this.chat(
      `Create 5 MCQ quiz questions on "${topic}". Format each as:\nQ: question\nA) option\nB) option\nC) option\nD) option\nCORRECT: letter\nEXPLANATION: why\nDIFFICULTY: easy/medium/hard`,
      'quiz'
    );
    const quiz = this.parseQuiz(quizResponse.content);

    // Generate mind map
    const mindMapResponse = await this.chat(
      `Create a mind map structure for "${topic}". Format as JSON:\n{"topic": "...", "children": [{"topic": "...", "children": [...]}]}`,
      'notes'
    );
    const mindMap = this.parseMindMap(mindMapResponse.content, topic);

    return {
      explanation: explanation.content,
      notes: notes.content,
      flashcards,
      quiz,
      mindMap,
      revision: revision.content,
    };
  }

  // Parsers for structured data
  private parseFlashcards(content: string): Flashcard[] {
    const cards: Flashcard[] = [];
    const blocks = content.split(/FRONT:|Q:/i).filter(Boolean);

    for (const block of blocks.slice(0, 8)) {
      const lines = block.trim().split('\n').map(l => l.trim());
      const front = lines[0] || '';
      const backLine = lines.find(l => /^BACK:|A:/i.test(l));
      const diffLine = lines.find(l => /DIFFICULTY:/i.test(l));
      const back = backLine?.replace(/^BACK:|A:/i, '').trim() || '';
      const difficulty = diffLine?.includes('hard') ? 'hard' : diffLine?.includes('medium') ? 'medium' : 'easy';

      if (front && back) {
        cards.push({ front, back, difficulty });
      }
    }

    return cards.length > 0 ? cards : [
      { front: `What is ${content.slice(0, 30)}?`, back: 'Answer generation in progress...', difficulty: 'easy' }
    ];
  }

  private parseQuiz(content: string): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    const blocks = content.split(/\d+\.\s*/).filter(Boolean);

    for (const block of blocks.slice(0, 5)) {
      const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length >= 4) {
        const question = lines[0];
        const options = lines.slice(1, 5).map(l => l.replace(/^[A-D]\)\s*/i, ''));
        const correctLine = lines.find(l => /^CORRECT:/i.test(l));
        const correctLetter = correctLine?.replace(/CORRECT:\s*/i, '').trim()[0]?.toUpperCase() || 'A';
        const correctIndex = 'ABCD'.indexOf(correctLetter);
        const explanationLine = lines.find(l => /^EXPLANATION:/i.test(l));
        const explanation = explanationLine?.replace(/^EXPLANATION:\s*/i, '') || '';

        questions.push({
          question,
          options: options.length === 4 ? options : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndex: Math.max(0, correctIndex),
          explanation,
          difficulty: 'medium',
        });
      }
    }

    return questions;
  }

  private parseMindMap(content: string, fallbackTopic: string): MindMapNode {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {}

    return {
      topic: fallbackTopic,
      children: [
        { topic: 'Definition', children: [], keywords: ['what', 'meaning'] },
        { topic: 'Key Concepts', children: [], keywords: ['important', 'main'] },
        { topic: 'Formulas', children: [], keywords: ['equations', 'calculations'] },
        { topic: 'Examples', children: [], keywords: ['applications', 'uses'] },
        { topic: 'Exam Tips', children: [], keywords: ['important', 'frequent'] },
      ],
    };
  }

  /** Clear conversation history */
  clearHistory() {
    this.conversationHistory = [];
  }

  /** Get conversation history */
  getHistory(): AgentMessage[] {
    return this.conversationHistory;
  }
}

// Singleton instance
export const aiOrchestrator = new AgentOrchestrator();
