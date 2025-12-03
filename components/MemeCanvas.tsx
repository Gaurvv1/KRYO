import React, { useState, useEffect } from 'react';
import { MemeResponse } from '../types';

interface MemeCanvasProps {
  imageSrc: string | null;
  memeData: MemeResponse | null;
  loading: boolean;
}

const LOADING_MESSAGES = [
  "Consulting the whales...",
  "Mining comedy gold...",
  "Calculating gas fees...",
  "HODLing for the punchline...",
  "Rug-pulling bad jokes...",
  "Validating on-chain humor...",
  "Checking fear & greed index...",
  "Deploying meme smart contract...",
  "Analyzing candlestick patterns...",
  "Minting fresh content..."
];

export const MemeCanvas: React.FC<MemeCanvasProps> = ({ imageSrc, memeData, loading }) => {
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    if (!loading) return;
    
    // Pick a random message initially
    setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);

    const interval = setInterval(() => {
      setLoadingMessage((prev) => {
         const currentIndex = LOADING_MESSAGES.indexOf(prev);
         const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
         return LOADING_MESSAGES[nextIndex];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [loading]);

  if (!imageSrc) {
    return (
      <div className="w-full h-96 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-400 flex-col gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>Upload a photo to start</p>
      </div>
    );
  }

  const overlay = memeData?.overlay_style;
  const displayText = memeData?.safe_alternative || memeData?.meme_text;

  // Position Logic
  const positionClass = (() => {
    switch (overlay?.position) {
      case 'top': return 'top-8 left-1/2 -translate-x-1/2';
      case 'bottom': return 'bottom-8 left-1/2 -translate-x-1/2';
      case 'center': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      default: return 'bottom-8 left-1/2 -translate-x-1/2';
    }
  })();

  // Style Construction
  const textStyle: React.CSSProperties = {
    color: overlay?.text_color || 'white',
    // Fallback shadow if stroke not fully supported or requested
    textShadow: overlay?.shadow ? '2px 2px 4px rgba(0,0,0,0.9)' : 'none',
  };

  if (overlay?.stroke_width && overlay.stroke_width > 0) {
    // Webkit stroke for broader support in modern browsers
    (textStyle as any).WebkitTextStroke = `${overlay.stroke_width / 2}px black`;
  }

  const bgGradientStyle: React.CSSProperties = overlay?.background_gradient ? {
    background: `linear-gradient(${overlay.background_gradient.angle}deg, ${overlay.background_gradient.from}CC, ${overlay.background_gradient.to}CC)`, // CC for ~80% opacity
    padding: '1rem',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
  } : {};

  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-black group transition-all duration-500">
      <img 
        src={imageSrc} 
        alt="Meme Base" 
        className={`w-full h-auto max-h-[600px] object-contain mx-auto transition-all duration-500 ${loading ? 'opacity-40 blur-sm scale-105' : 'opacity-100 scale-100'}`}
      />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-20 animate-fade-in">
          <div className="bg-gray-900/80 backdrop-blur-md p-8 rounded-2xl border border-indigo-500/30 flex flex-col items-center gap-5 shadow-2xl shadow-indigo-500/20 max-w-xs text-center">
            <div className="relative w-20 h-20">
               {/* Outer pulsing ring */}
               <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping"></div>
               {/* Spinning gradient ring */}
               <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-purple-500 border-b-pink-500 border-l-transparent animate-spin"></div>
               {/* Inner static icon */}
               <div className="absolute inset-0 flex items-center justify-center text-3xl animate-bounce">
                  🚀
               </div>
            </div>
            
            <div className="space-y-1">
               <div className="text-white font-bold text-lg leading-tight min-h-[3.5rem] flex items-center justify-center">
                 {loadingMessage}
               </div>
               <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-progress"></div>
               </div>
            </div>
          </div>
        </div>
      )}

      {displayText && !loading && (
        <div className={`absolute ${positionClass} w-[90%] md:w-auto md:max-w-[90%] text-center z-10 pointer-events-none`}>
          <div style={bgGradientStyle} className="inline-block animate-pop-in">
            <h2 
              className="meme-font text-3xl md:text-5xl font-bold uppercase tracking-wide leading-tight break-words"
              style={textStyle}
            >
              {displayText}
            </h2>
          </div>
        </div>
      )}

      {/* Hashtags Footer */}
      {memeData?.hashtags && !loading && (
         <div className="absolute bottom-2 right-2 flex flex-wrap justify-end gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {memeData.hashtags.map(tag => (
                <span key={tag} className="text-xs font-mono text-white/90 bg-black/60 px-2 py-1 rounded backdrop-blur-sm shadow-sm">{tag}</span>
            ))}
         </div>
      )}
      
      <style>{`
        @keyframes progress {
          0% { width: 0%; transform: translateX(-100%); }
          100% { width: 100%; transform: translateX(0); }
        }
        .animate-progress {
          animation: progress 2s infinite linear;
        }
        @keyframes pop-in {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
            animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};