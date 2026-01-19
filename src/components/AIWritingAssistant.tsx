import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Wand2, FileText, BookOpen, PenTool, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface AIWritingAssistantProps {
  onInsertText: (text: string) => void;
  currentText?: string;
}

type AssistMode = 'expand' | 'summarize' | 'improve' | 'generate';

export const AIWritingAssistant: React.FC<AIWritingAssistantProps> = ({
  onInsertText,
  currentText = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMode, setSelectedMode] = useState<AssistMode>('generate');

  const modes = [
    { id: 'generate' as const, label: 'Generate', icon: Wand2, desc: 'Create new content' },
    { id: 'expand' as const, label: 'Expand', icon: FileText, desc: 'Add more details' },
    { id: 'summarize' as const, label: 'Summarize', icon: BookOpen, desc: 'Make it shorter' },
    { id: 'improve' as const, label: 'Improve', icon: PenTool, desc: 'Enhance writing' },
  ];

  const getSystemPrompt = (mode: AssistMode): string => {
    switch (mode) {
      case 'expand':
        return 'You are a writing assistant. Expand and add more details to the given text while maintaining the original meaning and style. Write naturally as if handwritten.';
      case 'summarize':
        return 'You are a writing assistant. Summarize the given text into a concise version while keeping the key points. Write naturally as if for handwritten notes.';
      case 'improve':
        return 'You are a writing assistant. Improve the given text by fixing grammar, enhancing clarity, and making it flow better. Keep it natural and suitable for handwritten notes.';
      case 'generate':
        return 'You are a creative writing assistant. Generate content based on the user\'s prompt. Write naturally, as if creating handwritten notes. Keep paragraphs short and scannable.';
    }
  };

  const handleAssist = async () => {
    const inputText = selectedMode === 'generate' ? prompt : currentText;
    
    if (!inputText.trim()) {
      toast.error(selectedMode === 'generate' 
        ? 'Please enter a topic or prompt' 
        : 'No text to work with - write something first');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-writing-assist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            mode: selectedMode,
            text: inputText,
            systemPrompt: getSystemPrompt(selectedMode),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'AI request failed');
      }

      // Handle streaming response
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
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullText += content;
                setResult(fullText);
              }
            } catch {
              // Ignore parse errors for partial chunks
            }
          }
        }
      }

      if (fullText) {
        toast.success('AI content generated!');
      }
    } catch (error) {
      console.error('AI assist error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get AI assistance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = () => {
    if (result) {
      onInsertText(result);
      setResult('');
      setPrompt('');
      toast.success('Text inserted into notes!');
    }
  };

  return (
    <Card className="p-3 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 text-left"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">AI Writing Assistant</h4>
            <p className="text-[10px] text-muted-foreground">Get help with your notes</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3">
              {/* Mode Selection */}
              <div className="grid grid-cols-4 gap-1.5">
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] transition-all ${
                      selectedMode === mode.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <mode.icon className="w-3.5 h-3.5" />
                    <span className="font-medium">{mode.label}</span>
                  </button>
                ))}
              </div>

              {/* Input */}
              {selectedMode === 'generate' && (
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What would you like me to write about?"
                  className="min-h-[60px] text-sm resize-none bg-background/50"
                />
              )}

              {selectedMode !== 'generate' && currentText && (
                <div className="p-2 bg-muted/30 rounded-lg">
                  <p className="text-[10px] text-muted-foreground mb-1">Working with:</p>
                  <p className="text-xs line-clamp-2">{currentText}</p>
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleAssist}
                disabled={isLoading}
                size="sm"
                className="w-full gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                {isLoading ? 'Generating...' : `${modes.find(m => m.id === selectedMode)?.label} Text`}
              </Button>

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                    <div className="p-3 bg-background rounded-lg border border-border/50 max-h-[150px] overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">{result}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleInsert}
                        size="sm"
                        className="flex-1 gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Insert into Notes
                      </Button>
                      <Button
                        onClick={() => setResult('')}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
