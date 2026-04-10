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
  // Handwriting DNA parameters (from analysis)
  slant?: number;          // degrees, -15 to 15
  penPressure?: number;    // 0.1 to 1.0
  strokeThickness?: number; // 0.5 to 3.0
  baselineJitterAmount?: number; // 0 to 5
  letterSpacingVariation?: number; // 0 to 3
}

interface AnimatedWordProps {
  word: string;
  wordIndex: number;
  wordSpacing: number;
  baselineVariation: number;
  delay: number;
  isNew: boolean;
  letterSpacingVariation: number;
}

const AnimatedWord = memo<AnimatedWordProps>(({ 
  word, wordIndex, wordSpacing, baselineVariation, delay, isNew, letterSpacingVariation,
}) => {
  const yOffset = useMemo(() => {
    return Math.sin(wordIndex * 3.7) * baselineVariation;
  }, [wordIndex, baselineVariation]);

  // Per-character letter spacing variation
  const letterStyle = useMemo(() => {
    if (letterSpacingVariation <= 0) return undefined;
    return { letterSpacing: `${(Math.sin(wordIndex * 5.3) * letterSpacingVariation).toFixed(2)}px` };
  }, [wordIndex, letterSpacingVariation]);

  if (!isNew) {
    return (
      <span 
        style={{ 
          marginRight: `${wordSpacing}px`, 
          display: 'inline',
          position: 'relative',
          top: `${yOffset}px`,
          ...letterStyle,
        }}
      >
        {word}
      </span>
    );
  }

  return (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: yOffset }}
      transition={{ duration: 0.15, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ 
        marginRight: `${wordSpacing}px`, 
        display: 'inline',
        position: 'relative',
        ...letterStyle,
      }}
    >
      {word.split('').map((char, charIndex) => (
        <motion.span
          key={charIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.08, delay: delay + charIndex * 0.025, ease: 'easeOut' }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
});

AnimatedWord.displayName = 'AnimatedWord';

export const HandwritingLine = memo(forwardRef<HTMLDivElement, HandwritingLineProps>(({
  line, lineIndex, settings, realPenMode, fontClass, isNewText = false,
  slant = 0, penPressure = 0.5, strokeThickness = 1, baselineJitterAmount = 2, letterSpacingVariation = 0,
}, ref) => {
  const prevTextRef = useRef(line.text);
  const [animatingWords, setAnimatingWords] = useState<Set<number>>(new Set());
  
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
        const timeout = setTimeout(() => setAnimatingWords(new Set()), 500);
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
    // Baseline jitter with configurable amount
    const effectiveJitterAmount = settings.baselineJitter ? baselineJitterAmount : 0;
    const jitterX = effectiveJitterAmount > 0 ? (Math.sin(lineIndex * 7) * effectiveJitterAmount) : 0;

    // Slant transform (CSS skewX — negative slant = right lean visually)
    const skewDeg = slant ? -slant * 0.5 : 0;

    // Pressure-based font weight: light pressure = 300, heavy = 700
    const pressureWeight = Math.round(300 + penPressure * 400);

    // Stroke thickness affects text-stroke (webkit) for extra weight
    const textStrokeWidth = strokeThickness > 1.5 ? `${(strokeThickness - 1) * 0.3}px` : undefined;

    if (realPenMode) {
      const adjustedH = h + variation.hueShift;
      const adjustedL = Math.max(10, Math.min(50, l + (variation.thickness - 1) * 20));
      return {
        color: `hsl(${adjustedH} ${s}% ${adjustedL}%)`,
        opacity: variation.opacity,
        fontWeight: Math.max(pressureWeight, variation.thickness > 1 ? 500 : 400),
        marginLeft: `${jitterX}px`,
        transform: skewDeg !== 0 ? `skewX(${skewDeg}deg)` : undefined,
        WebkitTextStroke: textStrokeWidth ? `${textStrokeWidth} currentColor` : undefined,
      };
    }

    return {
      color: `hsl(${baseHsl})`,
      marginLeft: `${jitterX}px`,
      fontWeight: pressureWeight,
      transform: skewDeg !== 0 ? `skewX(${skewDeg}deg)` : undefined,
      WebkitTextStroke: textStrokeWidth ? `${textStrokeWidth} currentColor` : undefined,
    };
  }, [lineIndex, settings.baselineJitter, realPenMode, h, s, l, baseHsl, variation, slant, penPressure, strokeThickness, baselineJitterAmount]);

  const visualLines = useMemo(() => {
    return String(line.text ?? '').split(/\r?\n/);
  }, [line.text]);

  const baselineVariation = settings.baselineJitter ? Math.max(1.5, baselineJitterAmount * 0.75) : 0;

  const wrapperStyle: React.CSSProperties = {
    display: 'block',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    ...lineStyle,
  };

  const isMobileViewport = typeof window !== 'undefined' && window.innerWidth < 768;
  const effectiveLineHeightPx = isMobileViewport ? 48 : settings.lineSpacing;

  const visualLineStyle: React.CSSProperties = {
    display: 'block',
    minHeight: `${effectiveLineHeightPx}px`,
    lineHeight: `${effectiveLineHeightPx}px`,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };

  if (line.text === '') {
    return (
      <div ref={ref} className={fontClass} style={{ ...wrapperStyle, ...visualLineStyle }}>
        <span className="opacity-0 select-none">&nbsp;</span>
      </div>
    );
  }

  return (
    <div ref={ref} className={fontClass} style={wrapperStyle}>
      {visualLines.map((textLine, vIndex) => {
        const words = textLine.split(' ');
        const baseDelay = vIndex * 0.02;

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
                    letterSpacingVariation={letterSpacingVariation}
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
