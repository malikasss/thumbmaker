import React, { useEffect, useRef, useState } from 'react';
import { ThumbnailTemplate } from '../types';
import { Download, Layout, Wand2, Type as TypeIcon, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ThumbnailEditorProps {
  template: ThumbnailTemplate;
  userImageUrl: string | null;
  bgImageUrl: string | null;
  onBack: () => void;
  isGeneratingBg: boolean;
}

export const ThumbnailEditor: React.FC<ThumbnailEditorProps> = ({ 
  template, 
  userImageUrl, 
  bgImageUrl, 
  onBack,
  isGeneratingBg
}) => {
  const [headline, setHeadline] = useState(template.headline);
  const [highlightWord, setHighlightWord] = useState(template.highlightWord);
  const [scale, setScale] = useState(1);
  const [removeBgSimulated, setRemoveBgSimulated] = useState(true);
  const [userImagePos, setUserImagePos] = useState({ x: 0, y: 0, scale: 1 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Basic responsive scaling for the preview area
    const updateScale = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.offsetWidth;
        // Target is 16:9 aspect ratio, let's say base width 800px
        const baseWidth = 800;
        setScale(Math.min(parentWidth / baseWidth, 1));
      }
    };
    window.addEventListener('resize', updateScale);
    updateScale();
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Split headline for highlighting
  const renderHeadline = () => {
    const parts = headline.split(highlightWord);
    return (
      <h1 
        className="font-black uppercase italic leading-[0.9] drop-shadow-2xl"
        style={{ 
          fontSize: '4rem', 
          color: template.colorPalette[0] === '#000000' && template.layoutType !== 'minimal' ? '#FFFFFF' : template.colorPalette[2] || 'white',
          textShadow: '4px 4px 0px rgba(0,0,0,0.8)'
        }}
      >
        {parts[0]}
        <span style={{ color: template.colorPalette[1] || '#22d3ee' }}>{highlightWord}</span>
        {parts[1]}
      </h1>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex justify-between items-center p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors text-sm">
            &larr; Back to Templates
          </button>
          <div className="h-6 w-px bg-slate-700"></div>
          <span className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
            <Layout size={16} /> {template.name}
          </span>
        </div>
        <button 
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-6 rounded-lg transition-all"
          onClick={() => alert("In a production app, this would generate a high-res PNG using html2canvas or server-side rendering.")}
        >
          <Download size={18} /> Export HD
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Controls */}
        <div className="w-80 bg-slate-800/50 border-r border-slate-700 p-6 overflow-y-auto custom-scrollbar">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Content & Design</h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <TypeIcon size={14} /> Headline Text
              </label>
              <textarea 
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none h-24 font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Sparkles size={14} /> Highlight Word
              </label>
              <input 
                type="text"
                value={highlightWord}
                onChange={(e) => setHighlightWord(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-cyan-400 font-bold focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div className="pt-6 border-t border-slate-700/50 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <ImageIcon size={14} /> Subject
                </label>
                <button 
                  onClick={() => setRemoveBgSimulated(!removeBgSimulated)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${removeBgSimulated ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}
                >
                  {removeBgSimulated ? 'BG Removed' : 'Original'}
                </button>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-slate-500">Scale Subject</label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1"
                  value={userImagePos.scale}
                  onChange={(e) => setUserImagePos(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700/50">
               <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Design Stats</h4>
               <ul className="text-xs space-y-1 text-slate-400">
                 <li className="flex justify-between"><span>Format:</span> <span className="text-slate-200">16:9 (1280x720)</span></li>
                 <li className="flex justify-between"><span>Color Strategy:</span> <span className="text-slate-200">{template.colorPalette.length} Tone High-Contrast</span></li>
                 <li className="flex justify-between"><span>Layout:</span> <span className="text-slate-200">{template.layoutType}</span></li>
               </ul>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-slate-950 flex items-center justify-center p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div ref={containerRef} className="w-full max-w-4xl flex justify-center">
            {/* The 16:9 Thumbnail Container */}
            <div 
              className="relative bg-black shadow-2xl overflow-hidden group select-none"
              style={{
                width: '800px',
                height: '450px',
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
              }}
            >
              {/* Layer 0: Background */}
              {bgImageUrl && !isGeneratingBg ? (
                 <img 
                   src={bgImageUrl} 
                   alt="Background" 
                   className="absolute inset-0 w-full h-full object-cover opacity-90" 
                 />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 to-black flex items-center justify-center">
                  {isGeneratingBg && <span className="animate-pulse text-cyan-400 font-mono">Generating Background...</span>}
                </div>
              )}

              {/* Layer 0.5: Overlay/Tint based on template */}
              <div className="absolute inset-0 mix-blend-overlay" style={{ backgroundColor: template.colorPalette[0], opacity: 0.3 }}></div>
              
              {/* Layer 1: User Image (Subject) */}
              {userImageUrl && (
                <div 
                  className="absolute bottom-0 transition-transform cursor-move active:cursor-grabbing"
                  style={{ 
                    right: template.layoutType === 'split' ? '-5%' : (template.layoutType === 'full-face' ? '0' : '5%'),
                    width: template.layoutType === 'full-face' ? '100%' : '55%',
                    transform: `translate(${userImagePos.x}px, ${userImagePos.y}px) scale(${userImagePos.scale})`,
                    zIndex: 10
                  }}
                  onMouseDown={(e) => {
                    // Simple drag logic
                    const startX = e.clientX - userImagePos.x;
                    const startY = e.clientY - userImagePos.y;
                    const handleMove = (ev: MouseEvent) => {
                       setUserImagePos(prev => ({...prev, x: ev.clientX - startX, y: ev.clientY - startY}));
                    };
                    const handleUp = () => {
                      window.removeEventListener('mousemove', handleMove);
                      window.removeEventListener('mouseup', handleUp);
                    };
                    window.addEventListener('mousemove', handleMove);
                    window.addEventListener('mouseup', handleUp);
                  }}
                >
                  <img 
                    src={userImageUrl} 
                    alt="Subject" 
                    className={`w-full h-auto object-contain pointer-events-none drop-shadow-2xl ${removeBgSimulated ? 'mask-image-gradient' : ''}`}
                    style={{ 
                      // Hacky "Remove BG" simulation using mask-image or similar if needed. 
                      // Real app needs true segmentation. 
                      // Here we rely on the visual style to blend it or assume user uploaded a cut-out.
                      // For this demo, let's just apply a bottom fade if simulated removal is on.
                      maskImage: removeBgSimulated ? 'linear-gradient(to bottom, black 80%, transparent 100%)' : 'none',
                      filter: removeBgSimulated ? 'contrast(1.1) brightness(1.1)' : 'none'
                    }}
                  />
                  {/* Visual Indicator of "AI Extraction" */}
                  {removeBgSimulated && (
                    <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
                  )}
                </div>
              )}

              {/* Layer 2: Graphic Elements */}
              {/* Simplified mock graphics */}
              {template.layoutType === 'split' && (
                <div className="absolute inset-y-0 left-1/2 w-1 bg-white/20 blur-sm z-20"></div>
              )}
              {template.graphicElements.includes('Arrow') && (
                <div className="absolute bottom-10 left-10 text-red-500 z-20 transform rotate-12 drop-shadow-lg">
                   {/* Mock Arrow */}
                   <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32 text-red-500"><path d="M12 2L15 14H22L12 22L2 14H9L12 2Z" /></svg>
                </div>
              )}

              {/* Layer 3: Text */}
              <div 
                className={`absolute z-30 p-8 ${
                  template.layoutType === 'split' ? 'left-4 top-1/4 w-1/2' : 
                  template.layoutType === 'full-face' ? 'left-8 bottom-8' :
                  'left-8 top-8 max-w-lg'
                }`}
              >
                {renderHeadline()}
              </div>

              {/* Badge/Stickers */}
              <div className="absolute top-6 right-6 z-40">
                 <div className="bg-red-600 text-white font-black uppercase px-3 py-1 text-xl shadow-lg -rotate-3">
                    New!
                 </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};