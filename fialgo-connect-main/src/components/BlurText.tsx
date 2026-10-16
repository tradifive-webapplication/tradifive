import React from 'react';
import { motion } from 'framer-motion';

interface BlurTextProps {
  text?: string;
  lines?: { text: string; style?: React.CSSProperties; className?: string; gradient?: [string, string] }[];
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  gradient?: [string, string]; // e.g. ["#ffffff", "#3b82f6"]
}

// Helper to parse hex to rgb
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [255, 255, 255];
}

export default function BlurText({ text, lines, className, style, delay = 0, gradient }: BlurTextProps) {
  const parsedLines = lines || (text ? text.split('\n').map(t => ({ text: t })) : []);
  
  // Count total words for global gradient
  let totalWords = 0;
  parsedLines.forEach(line => {
    totalWords += line.text.split(' ').filter(w => w.length > 0).length;
  });

  let wordCounter = 0;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        visible: { transition: { staggerChildren: 0.08, delayChildren: delay } },
        hidden: {}
      }}
      className={className}
      style={{ ...style, display: 'inline-block' }}
    >
      {parsedLines.map((line, lineIndex) => {
        const words = line.text.split(' ').filter(w => w.length > 0);
        
        // Use line gradient or global gradient
        const activeGradient = line.gradient || gradient;
        let c1 = [255,255,255], c2 = [255,255,255];
        if (activeGradient) {
          c1 = hexToRgb(activeGradient[0]);
          c2 = hexToRgb(activeGradient[1]);
        }

        return (
          <React.Fragment key={lineIndex}>
            <span className={line.className}>
              {words.map((word, wordIndex) => {
                const currentIndex = wordCounter++;
                const progress = totalWords > 1 ? currentIndex / (totalWords - 1) : 0;
                
                let interpolatedColor = undefined;
                if (activeGradient) {
                  const r = Math.round(c1[0] + (c2[0] - c1[0]) * progress);
                  const g = Math.round(c1[1] + (c2[1] - c1[1]) * progress);
                  const b = Math.round(c1[2] + (c2[2] - c1[2]) * progress);
                  interpolatedColor = `rgb(${r}, ${g}, ${b})`;
                }

                // If we have an interpolated color, use it. Otherwise use the line style or inherit.
                // We strip out background-clip properties if gradient is used, to avoid conflicts.
                const wordStyle: React.CSSProperties = {
                  display: 'inline-block',
                  marginRight: wordIndex === words.length - 1 ? 0 : '0.25em',
                  ...line.style
                };

                if (interpolatedColor) {
                  wordStyle.color = interpolatedColor;
                  delete wordStyle.background;
                  delete wordStyle.backgroundImage;
                  delete wordStyle.WebkitBackgroundClip;
                  delete wordStyle.WebkitTextFillColor;
                }

                return (
                  <motion.span
                    key={wordIndex}
                    variants={{
                      hidden: { opacity: 0, y: 15, filter: 'blur(8px)' },
                      visible: { 
                        opacity: 1, 
                        y: 0, 
                        filter: 'blur(0px)',
                        transition: { type: 'spring', damping: 25, stiffness: 120 }
                      }
                    }}
                    style={wordStyle}
                  >
                    {word}
                  </motion.span>
                );
              })}
            </span>
            {lineIndex < parsedLines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </motion.div>
  );
}
