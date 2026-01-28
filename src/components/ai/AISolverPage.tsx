import React, { useState, useCallback } from 'react';
import { 
  Upload, FileText, Sparkles, BookOpen, GraduationCap, Briefcase,
  Wand2, ArrowRight, Download, Copy, Check, Loader2, X, 
  Brain, Lightbulb, PenLine, FileOutput, BookMarked, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

type ProcessMode = 'solve' | 'improve' | 'summarize' | 'rewrite' | 'explain' | 'template' | 'notes';
type UserMode = 'student' | 'college' | 'professional';

const userModes = [
  { id: 'student' as const, label: 'Student', icon: BookOpen, desc: 'School homework & assignments' },
  { id: 'college' as const, label: 'College', icon: GraduationCap, desc: 'University projects & papers' },
  { id: 'professional' as const, label: 'Professional', icon: Briefcase, desc: 'Office documents & reports' },
];

const processModes = [
  { id: 'solve' as const, label: 'Solve', icon: Brain, desc: 'Solve problems & questions' },
  { id: 'improve' as const, label: 'Improve', icon: PenLine, desc: 'Fix grammar & enhance writing' },
  { id: 'summarize' as const, label: 'Summarize', icon: FileOutput, desc: 'Create concise summaries' },
  { id: 'rewrite' as const, label: 'Rewrite', icon: RefreshCw, desc: 'Fresh take, same meaning' },
  { id: 'explain' as const, label: 'Explain', icon: Lightbulb, desc: 'Break down complex topics' },
  { id: 'template' as const, label: 'Template', icon: FileText, desc: 'Format as assignment' },
  { id: 'notes' as const, label: 'Quick Notes', icon: BookMarked, desc: 'Convert to study notes' },
];

export const AISolverPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userMode, setUserMode] = useState<UserMode>('student');
  const [processMode, setProcessMode] = useState<ProcessMode>('solve');
  const [inputContent, setInputContent] = useState('');
  const [outputContent, setOutputContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState('');

  const handleProcess = useCallback(async () => {
    if (!inputContent.trim()) {
      toast.error('Please enter some content to process');
      return;
    }

    if (!user) {
      toast.error('Please sign in to use AI features');
      navigate('/auth');
      return;
    }

    setIsProcessing(true);
    setOutputContent('');

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          content: inputContent,
          processMode,
          userMode,
          title: title.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Processing failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setOutputContent(fullText);
            }
          } catch {
            // Ignore parse errors
          }
        }
      }

      if (fullText) toast.success('Content processed successfully!');
    } catch (error) {
      console.error('Processing error:', error);
      toast.error(error instanceof Error ? error.message : 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  }, [inputContent, processMode, userMode, title, user, navigate]);

  const handleCopy = useCallback(async () => {
    if (!outputContent) return;
    await navigator.clipboard.writeText(outputContent);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  }, [outputContent]);

  const handleDownload = useCallback(() => {
    if (!outputContent) return;
    
    const blob = new Blob([outputContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'processed-content'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded successfully!');
  }, [outputContent, title]);

  const handleClear = useCallback(() => {
    setInputContent('');
    setOutputContent('');
    setTitle('');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">AI Solver</h1>
                <p className="text-xs text-muted-foreground">Homework • Assignments • Documents</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* User Mode Selection */}
        <div className="mb-6">
          <p className="text-sm font-medium text-muted-foreground mb-3">I am a...</p>
          <div className="grid grid-cols-3 gap-3">
            {userModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setUserMode(mode.id)}
                className={`
                  relative p-4 rounded-2xl border-2 transition-all text-left
                  ${userMode === mode.id 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-border/50 hover:border-primary/30 hover:bg-muted/30'
                  }
                `}
              >
                <mode.icon className={`h-6 w-6 mb-2 ${userMode === mode.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="font-semibold text-sm">{mode.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="w-4 h-4" />
                Input
              </CardTitle>
              <CardDescription>Paste or type your content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="text"
                placeholder="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="Paste your homework, assignment, or any text here...

Examples:
• Math problems to solve
• Essays to improve
• Articles to summarize
• Topics to explain
• Content to format as assignments"
                className="min-h-[300px] resize-none text-sm"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{inputContent.length} characters</span>
                {inputContent && (
                  <Button variant="ghost" size="sm" onClick={handleClear}>
                    Clear all
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="w-4 h-4" />
                    Output
                  </CardTitle>
                  <CardDescription>AI-processed result</CardDescription>
                </div>
                {outputContent && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px] rounded-xl border bg-muted/20 p-4 overflow-auto">
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Processing with AI...</p>
                  </div>
                ) : outputContent ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{outputContent}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Wand2 className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Select a mode and click Process
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Process Modes */}
        <div className="mt-6">
          <p className="text-sm font-medium text-muted-foreground mb-3">What should I do?</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {processModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setProcessMode(mode.id)}
                className={`
                  p-3 rounded-xl border transition-all text-center
                  ${processMode === mode.id 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border/50 hover:border-primary/30 hover:bg-muted/30'
                  }
                `}
              >
                <mode.icon className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs font-medium">{mode.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Process Button */}
        <div className="mt-6 flex justify-center">
          <Button
            size="lg"
            onClick={handleProcess}
            disabled={isProcessing || !inputContent.trim()}
            className="px-8 gap-2 rounded-xl"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Process with AI
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 p-4 rounded-2xl bg-muted/30 border">
          <p className="font-medium text-sm mb-2">💡 Tips for best results:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Be specific with your content - include all relevant details</li>
            <li>• For math problems, clearly state the question and any given values</li>
            <li>• Use "Template" mode to format content as a proper assignment with headings</li>
            <li>• "Quick Notes" mode is perfect for exam preparation</li>
          </ul>
        </div>
      </main>
    </div>
  );
};
