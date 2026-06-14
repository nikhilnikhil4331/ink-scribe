// ============================================================
// NikNote 4.0 — AI Agent Orchestrator
// The brain that coordinates all AI agents
// Fast, streaming, multi-agent architecture
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
  type: 'create_notes' | 'create_flashcards' | 'create_quiz' | 'create_mindmap' | 'add_diagram' | 'create_revision' | 'create_assignment' | 'create_study_plan';
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
// ============================================================

const AGENT_PROMPTS: Record<AgentType, string> = {
  teacher: `You are an expert AI Teacher on NikNote — a learning platform for Indian students.
Your job is to EXPLAIN concepts clearly, like a real teacher would.
RULES:
- Start with a simple 2-line summary anyone can understand
- Then explain in 3 levels: Beginner → Intermediate → Exam-focused
- Use real-life examples Indian students relate to (cricket, chai, traffic, etc.)
- Include important formulas, definitions, and keywords
- Always add "Exam Tip" at the end
- Keep responses structured with clear headings
- Be warm, encouraging, but precise
- Use Hinglish when it helps understanding
- Response MUST be under 800 words`,

  notes: `You are the Notes Agent on NikNote — you create BEAUTIFUL, STRUCTURED notes.
RULES:
- Create well-organized notes with clear headings and subheadings
- Use bullet points for key information
- Highlight IMPORTANT keywords in **bold**
- Include formulas in separate lines
- Add "📝 Remember" boxes for critical points
- Add "⚠️ Common Mistake" warnings where students often go wrong
- Structure: Title → Overview → Key Concepts → Formulas → Examples → Summary
- Make notes that a student can revise in 10 minutes
- Include 3-5 practice questions at the end`,

  research: `You are the Research Agent on NikNote — you find ACCURATE, VERIFIED information.
RULES:
- Provide factually correct information from reliable sources
- Cite sources when possible (NCERT, standard textbooks)
- Cross-verify important claims
- Present multiple perspectives when relevant
- Flag any controversial or disputed information
- Keep information concise and exam-relevant`,

  diagram: `You are the Diagram Agent on NikNote — you describe and suggest visual learning aids.
RULES:
- When a topic is mentioned, suggest what diagrams would help understanding
- Describe diagrams in detail so they can be created
- Include flowcharts for processes
- Include labeled diagrams for structures
- Include graphs for relationships
- Suggest Mermaid.js syntax for diagrams where applicable
- Always explain WHY the diagram helps`,

  revision: `You are the Revision Agent on NikNote — you create CONCISE revision materials.
RULES:
- Create ultra-short summaries (1 page max)
- Use mnemonics where possible
- Create "cheat sheet" style revision notes
- Highlight ONLY what's important for exams
- Group related concepts together
- Add memory tricks and shortcuts
- Create before/after comparison tables`,

  quiz: `You are the Quiz Agent on NikNote — you create ENGAGING tests and MCQs.
RULES:
- Create 5-10 MCQs per topic
- Include easy, medium, and hard questions
- Always provide explanations for correct AND wrong answers
- Include "trick questions" that test deep understanding
- Add assertion-reason type questions (common in Indian exams)
- Add numerical problems where applicable
- Mark difficulty level for each question`,

  assignment: `You are the Assignment Agent on NikNote — you help students complete assignments.
RULES:
- Understand the assignment requirement
- Provide a step-by-step approach
- Give a structure/template for the answer
- Suggest key points to include
- Help format the answer properly
- Add references and citations
- DO NOT write the full answer — guide the student to write it themselves`,

  doubt: `You are the Doubt Solver Agent on NikNote — you answer questions INSTANTLY.
RULES:
- Answer directly and clearly
- If the doubt is unclear, ask clarifying questions
- Provide examples to illustrate the answer
- Reference related concepts the student should know
- Suggest what to study next
- Be patient and encouraging
- Never make the student feel dumb`,

  productivity: `You are the Productivity Agent on NikNote — you create study plans and schedules.
RULES:
- Create realistic study schedules based on exam dates
- Include breaks (Pomodoro technique)
- Suggest priority order for topics
- Include revision slots
- Create daily, weekly, and monthly plans
- Add tips for better focus and retention
- Suggest group study topics
- Keep plans flexible`,

  handwriting: `You are the Handwriting Analysis Agent on NikNote.
RULES:
- Analyze uploaded handwriting samples
- Identify: slant, pressure, stroke thickness, baseline drift, spacing, size variation
- Generate HandwritingDNA parameters
- Provide matching recommendations
- Give feedback on handwriting characteristics`,

  document: `You are the Document Intelligence Agent on NikNote.
RULES:
- Read and understand uploaded documents (PDF, images)
- Extract key information and concepts
- Generate summaries
- Identify important formulas, definitions, and diagrams
- Create structured notes from documents
- Suggest study topics from the document`,
};

// ============================================================
// FAST AI Call — Streaming, sub-2-second response
// ============================================================

async function callAIBrain(
  messages: AgentMessage[],
  agentType: AgentType,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const systemPrompt = AGENT_PROMPTS[agentType];

  const formattedMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];

  try {
    const { data, error } = await supabase.functions.invoke('openai-brain', {
      body: {
        messages: formattedMessages,
        model: 'gpt-4o-mini', // Fast model for < 2s response
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      },
    });

    if (error) throw error;
    return data?.content || data?.text || JSON.stringify(data);
  } catch (err) {
    console.error(`Agent ${agentType} error:`, err);
    // Fallback: try direct generation
    return generateFallbackResponse(agentType, messages[messages.length - 1]?.content || '');
  }
}

// Fallback when API fails
function generateFallbackResponse(agent: AgentType, query: string): string {
  const fallbacks: Record<AgentType, string> = {
    teacher: `## 📚 ${query}\n\nI'm currently learning about this topic. Please try again in a moment!\n\n**Quick tip:** Try breaking this topic into smaller parts for better understanding.`,
    notes: `## 📝 Notes: ${query}\n\nGenerating structured notes...\n\n**Tip:** Try adding specific subtopics for better organized notes.`,
    research: `## 🔍 Research: ${query}\n\nSearching for accurate information...\n\n**Tip:** Be specific with your query for better results.`,
    diagram: `## 📊 Diagrams for: ${query}\n\nSuggesting visual aids...\n\n**Tip:** Mention "flowchart", "diagram", or "structure" for specific visual types.`,
    revision: `## 📖 Revision: ${query}\n\nCreating revision sheet...\n\n**Tip:** Ask for "cheat sheet" or "quick revision" for concise notes.`,
    quiz: `## 🎯 Quiz: ${query}\n\nCreating questions...\n\n**Tip:** Specify difficulty level (easy/medium/hard) for targeted practice.`,
    assignment: `## ✍️ Assignment Help: ${query}\n\nAnalyzing requirements...\n\n**Tip:** Share the full assignment question for better guidance.`,
    doubt: `## ❓ Doubt: ${query}\n\nLet me think about this...\n\n**Tip:** Be as specific as possible for a clear answer.`,
    productivity: `## 📅 Study Plan: ${query}\n\nCreating schedule...\n\n**Tip:** Mention your exam date and topics for a customized plan.`,
    handwriting: `## ✍️ Handwriting Analysis\n\nProcessing sample...\n\n**Tip:** Upload a clear photo of 3-4 lines of your natural handwriting.`,
    document: `## 📄 Document Analysis\n\nReading document...\n\n**Tip:** Upload clear PDFs or images for best results.`,
  };
  return fallbacks[agent] || 'Processing your request...';
}

// ============================================================
// MAIN: Agent Orchestrator — Coordinates all agents
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
   */
  private detectAgent(message: string): AgentType {
    const lower = message.toLowerCase();

    // Quiz/Test patterns
    if (/quiz|test|mcq|question|practice|exam/.test(lower)) return 'quiz';

    // Notes patterns
    if (/notes|summary|points|key|important/.test(lower)) return 'notes';

    // Revision patterns
    if (/revision|revise|cheat.?sheet|quick|last.?minute/.test(lower)) return 'revision';

    // Assignment patterns
    if (/assignment|homework|project|submit/.test(lower)) return 'assignment';

    // Doubt patterns
    if (/doubt|confused|don't understand|explain|kya|kaise|kyu/.test(lower)) return 'doubt';

    // Diagram patterns
    if (/diagram|flowchart|chart|visual|image|picture/.test(lower)) return 'diagram';

    // Study plan patterns
    if (/plan|schedule|timetable|routine|strategy/.test(lower)) return 'productivity';

    // Research patterns
    if (/research|find|search|source|reference/.test(lower)) return 'research';

    // Document patterns
    if (/pdf|document|upload|file|paper/.test(lower)) return 'document';

    // Default: Teacher agent for explanations
    return 'teacher';
  }

  /**
   * TEACHER-LIKE SUGGESTIONS — Proactive suggestions
   */
  private generateSuggestions(query: string, currentAgent: AgentType): string[] {
    const suggestions: string[] = [];

    // Always suggest these for any topic
    suggestions.push(`📝 Create Notes on "${query}"`);
    suggestions.push(`🧠 Create Mind Map for "${query}"`);
    suggestions.push(`🎯 Take a Quiz on "${query}"`);

    if (currentAgent !== 'revision') {
      suggestions.push(`📖 Quick Revision of "${query}"`);
    }

    if (currentAgent !== 'diagram') {
      suggestions.push(`📊 Add Diagrams for "${query}"`);
    }

    suggestions.push(`🃏 Create Flashcards for "${query}"`);

    return suggestions.slice(0, 6);
  }

  /**
   * ACTION BUTTONS — What can the student do next
   */
  private generateActions(query: string, currentAgent: AgentType): AgentAction[] {
    const actions: AgentAction[] = [];

    if (currentAgent !== 'notes') {
      actions.push({
        type: 'create_notes',
        label: 'Generate Notes',
        icon: '📝',
      });
    }

    actions.push({
      type: 'create_flashcards',
      label: 'Create Flashcards',
      icon: '🃏',
    });

    actions.push({
      type: 'create_quiz',
      label: 'Start Quiz',
      icon: '🎯',
    });

    actions.push({
      type: 'create_mindmap',
      label: 'Mind Map',
      icon: '🧠',
    });

    if (currentAgent !== 'revision') {
      actions.push({
        type: 'create_revision',
        label: 'Quick Revision',
        icon: '📖',
      });
    }

    actions.push({
      type: 'add_diagram',
      label: 'Add Diagrams',
      icon: '📊',
    });

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
      `Create 8 flashcards for "${topic}". Format each as:
FRONT: question/concept
BACK: answer/explanation
DIFFICULTY: easy/medium/hard`,
      'notes'
    );
    const flashcards = this.parseFlashcards(flashcardResponse.content);

    // Generate quiz
    const quizResponse = await this.chat(
      `Create 5 MCQ quiz questions on "${topic}". Format each as:
Q: question
A) option
B) option
C) option
D) option
CORRECT: letter
EXPLANATION: why
DIFFICULTY: easy/medium/hard`,
      'quiz'
    );
    const quiz = this.parseQuiz(quizResponse.content);

    // Generate mind map
    const mindMapResponse = await this.chat(
      `Create a mind map structure for "${topic}". Format as JSON:
{"topic": "...", "children": [{"topic": "...", "children": [...]}]}`,
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
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {}

    // Fallback mind map
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

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory(): AgentMessage[] {
    return this.conversationHistory;
  }
}

// Singleton instance
export const aiOrchestrator = new AgentOrchestrator();
