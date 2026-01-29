import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileUploadZoneProps {
  onContentExtracted: (content: string, fileName: string) => void;
  className?: string;
}

const _SUPPORTED_TYPES = {
  'image/jpeg': 'Image (JPEG)',
  'image/png': 'Image (PNG)',
  'image/webp': 'Image (WebP)',
  'application/pdf': 'PDF Document',
  'text/plain': 'Text File',
  'application/msword': 'Word Document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document (DOCX)',
};

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onContentExtracted, className }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);

    try {
      // For text files, read directly
      if (file.type === 'text/plain') {
        const text = await file.text();
        onContentExtracted(text, file.name);
        toast.success('Text file loaded successfully!');
        setIsProcessing(false);
        return;
      }

      // For images, use OCR simulation (in production, use a real OCR service)
      if (file.type.startsWith('image/')) {
        // Simulate image text extraction
        toast.info('Image uploaded! Paste the text content manually for now.');
        onContentExtracted(`[Image uploaded: ${file.name}]\n\nPlease type or paste the content from this image below.`, file.name);
        setIsProcessing(false);
        return;
      }

      // For PDFs and Word docs
      if (file.type === 'application/pdf' || file.type.includes('word')) {
        toast.info('Document uploaded! Paste the text content manually for now.');
        onContentExtracted(`[Document uploaded: ${file.name}]\n\nPlease type or paste the content from this document below.`, file.name);
        setIsProcessing(false);
        return;
      }

      toast.error('Unsupported file type');
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  }, [onContentExtracted]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const clearFile = useCallback(() => {
    setUploadedFile(null);
  }, []);

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {uploadedFile ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 rounded-2xl border-2 border-green-500/30 bg-green-500/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isProcessing ? (
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm truncate max-w-[200px]">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {isProcessing ? 'Processing...' : 'File loaded successfully'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={clearFile} disabled={isProcessing}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer
              ${isDragging 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-border/50 hover:border-primary/50 hover:bg-muted/30'
              }
            `}
          >
            <input
              type="file"
              accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
              onChange={handleFileSelect}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center text-center">
              <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors
                ${isDragging ? 'bg-primary/20' : 'bg-muted'}
              `}>
                <Upload className={`w-6 h-6 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <p className="font-medium text-sm">
                {isDragging ? 'Drop your file here' : 'Upload a file'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Images, PDFs, Word docs, or text files
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
