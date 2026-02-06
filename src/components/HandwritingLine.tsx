import React, { useMemo, useEffect, useState, useRef, memo, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { NoteLine, LINE_INK_COLORS, generateRealPenVariation } from '@/types/noteLine';
import { NoteSettings } from '@/types/notes';

interface HandwritingLineProps {
  line: NoteLine;
  lineIndex: number;
  settings: NoteSettings;
  realPenMode: boolean;
  fontClass: string;
  isNewText?: boolean;
}

interface AnimatedWordProps {
  word: string;
  wordIndex: number;
  wordSpacing: number;
  baselineVariation: number;
  delay: number;
  isNew: boolean;
}

// Animated word component with staggered character animation
const AnimatedWord = memo<AnimatedWordProps>(({ 
  word, 
  wordIndex, 
  wordSpacing, 
  baselineVariation, 
  delay,
  isNew,
}) => {
  // Slight baseline variation per word for natural handwriting feel
  const yOffset = useMemo(() => {
    return Math.sin(wordIndex * 3.7) * baselineVariation;
  }, [wordIndex, baselineVariation]);
  if (!isNew) {
    // Static render for existing text
    return (
      <span 
        style={{ 
          marginRight: `${wordSpacing}px`, 
          display: 'inline',
          position: 'relative',
          top: `${yOffset}px`,
        }}
      >
        {word}
      </span>
    );
  }

  // Animated render for new text
  return (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: yOffset }}
      transition={{
        duration: 0.15,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={{ 
        marginRight: `${wordSpacing}px`, 
        display: 'inline',
        position: 'relative',
      }}
    >
      {word.split('').map((char, charIndex) => (
        <motion.span
          key={charIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.08,
            delay: delay + charIndex * 0.025, // 25ms stagger per character
            ease: 'easeOut',
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
});

AnimatedWord.displayName = 'AnimatedWord';

// Use forwardRef to allow refs to be passed to the component
export const HandwritingLine = memo(forwardRef<HTMLDivElement, HandwritingLineProps>(({
  line,
  lineIndex,
  settings,
  realPenMode,
  fontClass,
  isNewText = false,
}, ref) => {
  const prevTextRef = useRef(line.text);
  const [animatingWords, setAnimatingWords] = useState<Set<number>>(new Set());
  
  // Detect which words are new for animation
  useEffect(() => {
    const prevWords = prevTextRef.current.split(' ');
    const currentWords = line.text.split(' ');
    
    if (line.text !== prevTextRef.current) {
      const newWordIndices = new Set<number>();
      currentWords.forEach((word, index) => {
        if (index >= prevWords.length || word !== prevWords[index]) {
          newWordIndices.add(index);
        }
      });
      
      if (newWordIndices.size > 0) {
        setAnimatingWords(newWordIndices);
        
        // Clear animation state after animation completes
        const timeout = setTimeout(() => {
          setAnimatingWords(new Set());
        }, 500);
        
        prevTextRef.current = line.text;
        return () => clearTimeout(timeout);
      }
    }
    
    prevTextRef.current = line.text;
  }, [line.text]);

  const inkColor = LINE_INK_COLORS.find(c => c.value === line.color);
  const baseHsl = inkColor?.hsl || '220 20% 12%';
  const [h, s, l] = baseHsl.split(' ').map(v => parseFloat(v));
  const variation = generateRealPenVariation(lineIndex, realPenMode);

  const lineStyle = useMemo(() => {
    const jitterX = settings.baselineJitter ? (Math.sin(lineIndex * 7) * 2) : 0;

    if (realPenMode) {
      const adjustedH = h + variation.hueShift;
      const adjustedL = Math.max(10, Math.min(50, l + (variation.thickness - 1) * 20));
      return {
        color: `hsl(${adjustedH} ${s}% ${adjustedL}%)`,
        opacity: variation.opacity,
        fontWeight: variation.thickness > 1 ? 500 : 400,
        marginLeft: `${jitterX}px`,
      };
    }

    return {
      color: `hsl(${baseHsl})`,
      marginLeft: `${jitterX}px`,
    };
  }, [lineIndex, settings.baselineJitter, settings.strokeRandomness, realPenMode, h, s, l, baseHsl, variation]);

  // CRITICAL: Render embedded newlines as real stacked DOM blocks.
  // Even though the editor is line-based, OCR/paste pipelines can accidentally
  // insert "\n" inside a single line. If we render that inside a fixed-height
  // line container, it visually overlaps and export captures the same overlap.
  const visualLines = useMemo(() => {
    // Preserve empty lines for spacing.
    return String(line.text ?? '').split(/\r?\n/);
  }, [line.text]);

  const baselineVariation = settings.baselineJitter ? 1.5 : 0;

  // Outer wrapper: flow-based layout, never absolute/layered.
  const wrapperStyle: React.CSSProperties = {
    display: 'block',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    ...lineStyle,
  };

  // Each visual line is a real block that participates in normal document flow.
  const isMobileViewport = typeof window !== 'undefined' && window.innerWidth < 768;
  const effectiveLineHeightPx = isMobileViewport ? 48 : settings.lineSpacing;

  const visualLineStyle: React.CSSProperties = {
    display: 'block',
    minHeight: `${effectiveLineHeightPx}px`,
    lineHeight: `${effectiveLineHeightPx}px`,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };

  // Empty line - render with minimum height but as block element
  if (line.text === '') {
    return (
      <div 
        ref={ref}
        className={fontClass}
        style={{ ...wrapperStyle, ...visualLineStyle }}
      >
        {/* Invisible character to maintain line height */}
        <span className="opacity-0 select-none">&nbsp;</span>
      </div>
    );
  }

  return (
    <div 
      ref={ref}
      className={fontClass}
      style={wrapperStyle}
    >
      {visualLines.map((textLine, vIndex) => {
        // Keep exact spacing intent: treat repeated spaces as separators.
        // We still animate at word granularity for performance.
        const words = textLine.split(' ');
        const baseDelay = vIndex * 0.02; // small extra stagger per visual line

        return (
          <div key={`${line.id}-vline-${vIndex}`} style={visualLineStyle}>
            {textLine === '' ? (
              <span className="opacity-0 select-none">&nbsp;</span>
            ) : (
              words.map((word, wordIndex) => (
                <React.Fragment key={`${vIndex}-${wordIndex}-${word}`}>
                  <AnimatedWord
                    word={word}
                    wordIndex={wordIndex}
                    wordSpacing={0}
                    baselineVariation={baselineVariation}
                    delay={baseDelay + wordIndex * 0.03}
                    isNew={isNewText || animatingWords.has(wordIndex)}
                  />
                  {wordIndex < words.length - 1 && (
                    <span style={{ marginRight: `${settings.wordSpacing}px` }}> </span>
                  )}
                </React.Fragment>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}));

HandwritingLine.displayName = 'HandwritingLine';
