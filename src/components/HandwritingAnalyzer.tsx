import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Loader2, Camera, X, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { NoteSettings, HandwritingFont, InkColor } from '@/types/notes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HandwritingAnalyzerProps {
  onApplyStyle: (settings: Partial<NoteSettings>) => void;
}

interface AnalysisResult {
  suggestedFont: HandwritingFont;
  fontSize: number;
  lineSpacing: number;
  wordSpacing: number;
  baselineJitter: boolean;
  strokeRandomness: boolean;
  inkColor: InkColor;
  analysisNotes: string;
}

export const HandwritingAnalyzer: React.FC<HandwritingAnalyzerProps> = ({ onApplyStyle }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { session } = useAuth();
  const navigate = useNavigate();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreviewImage(base64);
      setAnalysisResult(null);
      await analyzeHandwriting(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeHandwriting = async (imageBase64: string) => {
    setIsAnalyzing(true);
    
    try {
      if (!session?.access_token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const { data, error } = await supabase.functions.invoke('analyze-handwriting', {
        body: { imageBase64 },
      });

      if (error) {
        // Standardize common auth failure messaging
        const status = (error as unknown as { status?: number })?.status;
        if (status === 401) {
          toast.error('Please login first');
          navigate('/login');
          return;
        }

        throw new Error(error.message || 'Analysis failed');
      }

      const result = data as AnalysisResult;
      setAnalysisResult(result);
      toast.success('Handwriting analyzed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze handwriting');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyStyle = () => {
    if (!analysisResult) return;

    onApplyStyle({
      font: analysisResult.suggestedFont,
      fontSize: analysisResult.fontSize,
      lineSpacing: analysisResult.lineSpacing,
      wordSpacing: analysisResult.wordSpacing,
      baselineJitter: analysisResult.baselineJitter,
      strokeRandomness: analysisResult.strokeRandomness,
      inkColor: analysisResult.inkColor,
    });

    toast.success('Style applied! Check your preview');
  };

  const clearImage = () => {
    setPreviewImage(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!previewImage ? (
        <Card
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border/50 hover:border-primary/50 transition-colors cursor-pointer p-6 text-center bg-muted/20"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Upload Handwriting Sample</p>
              <p className="text-xs text-muted-foreground mt-1">
                AI will analyze and match the style
              </p>
            </div>
            <Button variant="outline" size="sm" className="mt-2 gap-2">
              <Camera className="w-4 h-4" />
              Choose Image
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Preview Image */}
          <div className="relative rounded-xl overflow-hidden border border-border">
            <img
              src={previewImage}
              alt="Handwriting sample"
              className="w-full max-h-48 object-contain bg-white"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-background/80 hover:bg-background"
              onClick={clearImage}
            >
              <X className="w-4 h-4" />
            </Button>
            
            {isAnalyzing && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-sm font-medium">Analyzing handwriting...</span>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <h4 className="font-medium text-sm">Analysis Complete</h4>
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {analysisResult.analysisNotes}
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-background/50 rounded-lg p-2 flex flex-col">
                    <span className="text-muted-foreground text-[10px]">Font</span>
                    <span className="font-medium capitalize truncate">
                      {analysisResult.suggestedFont.replace(/-/g, ' ')}
                    </span>
                  </div>
                  <div className="bg-background/50 rounded-lg p-2 flex flex-col">
                    <span className="text-muted-foreground text-[10px]">Size</span>
                    <span className="font-medium">{analysisResult.fontSize}px</span>
                  </div>
                  <div className="bg-background/50 rounded-lg p-2 flex flex-col">
                    <span className="text-muted-foreground text-[10px]">Ink Color</span>
                    <span className="font-medium capitalize">{analysisResult.inkColor}</span>
                  </div>
                  <div className="bg-background/50 rounded-lg p-2 flex flex-col">
                    <span className="text-muted-foreground text-[10px]">Line Spacing</span>
                    <span className="font-medium">{analysisResult.lineSpacing}px</span>
                  </div>
                </div>

                <Button
                  onClick={handleApplyStyle}
                  className="w-full gap-2"
                  size="sm"
                >
                  <Check className="w-4 h-4" />
                  Apply This Style
                </Button>
              </div>
            </Card>
          )}

          {/* Retry button */}
          {!isAnalyzing && analysisResult && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="w-full gap-2"
            >
              <Upload className="w-4 h-4" />
              Try Another Image
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
