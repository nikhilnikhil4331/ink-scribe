import React, { useMemo, memo } from 'react';
import { NoteSettings, FONT_OPTIONS } from '@/types/notes';
import { generateJitter, generateRotation, getRandomOpacity } from '@/utils/handwriting';

interface HandwrittenTextProps {
  text: string;
  settings: NoteSettings;
  pageNumber?: number;
  totalPages?: number;
}

const HandwrittenWord = memo(({ 
  word, 
  settings, 
  index 
}: { 
  word: string; 
  settings: NoteSettings; 
  index: number;
}) => {
  const style = useMemo(() => {
    const jitterX = generateJitter(settings.baselineJitter, 1);
    const jitterY = generateJitter(settings.baselineJitter, 2);
    const rotation = generateRotation(settings.strokeRandomness, 0.5);
    const opacity = getRandomOpacity(settings.strokeRandomness);
    const extraSpacing = settings.strokeRandomness 
      ? (Math.random() - 0.5) * 3 
      : 0;

    return {
      transform: `translate(${jitterX}px, ${jitterY}px) rotate(${rotation}deg)`,
      opacity,
      marginRight: `${settings.wordSpacing + extraSpacing}px`,
      display: 'inline-block',
    };
  }, [word, settings.baselineJitter, settings.strokeRandomness, settings.wordSpacing, index]);

  return <span style={style}>{word}</span>;
});

HandwrittenWord.displayName = 'HandwrittenWord';

const HandwrittenLine = memo(({ 
  line, 
  settings, 
  lineIndex 
}: { 
  line: string; 
  settings: NoteSettings; 
  lineIndex: number;
}) => {
  const words = line.split(' ');
  const lineJitter = generateJitter(settings.baselineJitter, 1);

  return (
    <div 
      style={{ 
        height: `${settings.lineSpacing}px`,
        display: 'flex',
        alignItems: 'center',
        transform: `translateY(${lineJitter}px)`,
      }}
    >
      {words.map((word, wordIndex) => (
        <HandwrittenWord 
          key={`${lineIndex}-${wordIndex}`} 
          word={word} 
          settings={settings} 
          index={wordIndex}
        />
      ))}
    </div>
  );
});

HandwrittenLine.displayName = 'HandwrittenLine';

export const HandwrittenText: React.FC<HandwrittenTextProps> = ({
  text,
  settings,
  pageNumber,
  totalPages,
}) => {
  const fontClass = FONT_OPTIONS.find(f => f.value === settings.font)?.className || 'font-handwriting-1';
  const inkClass = settings.inkColor === 'blue' ? 'ink-blue' : 'ink-black';
  
  const pageStyleClass = {
    plain: 'paper-plain',
    ruled: 'paper-ruled',
    'single-line': 'paper-single-line',
  }[settings.pageStyle];

  const lines = text.split('\n');

  return (
    <div 
      className={`w-full aspect-[210/297] ${pageStyleClass} paper-shadow relative overflow-hidden`}
      style={{
        paddingTop: `${settings.margins.top}px`,
        paddingRight: `${settings.margins.right}px`,
        paddingBottom: `${settings.margins.bottom}px`,
        paddingLeft: `${settings.margins.left}px`,
      }}
    >
      {/* Left margin line */}
      {settings.margins.left > 30 && (
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-margin"
          style={{ left: `${settings.margins.left - 10}px` }}
        />
      )}

      {/* Header */}
      {settings.headerFooter.showHeader && (
        <div className={`${fontClass} ${inkClass} text-sm mb-4 flex justify-between`} style={{ fontSize: settings.fontSize * 0.6 }}>
          {settings.headerFooter.name && <span>Name: {settings.headerFooter.name}</span>}
          {settings.headerFooter.rollNo && <span>Roll No: {settings.headerFooter.rollNo}</span>}
          {settings.headerFooter.subject && <span>Subject: {settings.headerFooter.subject}</span>}
        </div>
      )}

      {/* Content */}
      <div 
        className={`${fontClass} ${inkClass} leading-relaxed`}
        style={{ fontSize: `${settings.fontSize}px` }}
      >
        {lines.map((line, index) => (
          <HandwrittenLine 
            key={index} 
            line={line} 
            settings={settings} 
            lineIndex={index}
          />
        ))}
      </div>

      {/* Footer */}
      {(settings.headerFooter.showFooter || settings.headerFooter.showPageNumber) && (
        <div 
          className={`absolute bottom-4 left-0 right-0 ${fontClass} ${inkClass} text-center`}
          style={{ 
            fontSize: settings.fontSize * 0.5,
            paddingLeft: settings.margins.left,
            paddingRight: settings.margins.right,
          }}
        >
          {settings.headerFooter.showPageNumber && pageNumber && totalPages && (
            <span>Page {pageNumber} of {totalPages}</span>
          )}
        </div>
      )}
    </div>
  );
};
