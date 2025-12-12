import React from 'react';
import { ThumbnailTemplate } from '../types';
import { Check, Info, Palette } from 'lucide-react';

interface TemplateCardProps {
  template: ThumbnailTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, isSelected, onSelect }) => {
  return (
    <div 
      onClick={onSelect}
      className={`
        relative group cursor-pointer rounded-xl p-5 border-2 transition-all duration-300
        ${isSelected 
          ? 'border-cyan-400 bg-slate-800/80 shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
          : 'border-slate-700 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800/60'
        }
      `}
    >
      {isSelected && (
        <div className="absolute -top-3 -right-3 bg-cyan-400 text-slate-900 rounded-full p-1 shadow-lg">
          <Check size={16} strokeWidth={3} />
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
          {template.name}
        </h3>
        <span className="text-xs font-mono px-2 py-1 rounded bg-slate-900 text-slate-400 border border-slate-700">
          {template.layoutType.toUpperCase()}
        </span>
      </div>

      <div className="space-y-3">
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
          <p className="text-sm text-slate-400 mb-1 uppercase text-[10px] tracking-wider font-semibold">Headline Preview</p>
          <div className="font-black text-xl leading-tight uppercase italic text-white">
            {template.headline.replace(template.highlightWord, '')} <span style={{ color: template.colorPalette[1] || '#22d3ee' }}>{template.highlightWord}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Palette size={14} className="text-slate-500" />
          <div className="flex space-x-1">
            {template.colorPalette.map((color, i) => (
              <div 
                key={i} 
                className="w-4 h-4 rounded-full border border-slate-600 shadow-sm" 
                style={{ backgroundColor: color }} 
                title={color}
              />
            ))}
          </div>
        </div>

        <div className="flex items-start space-x-2 text-xs text-slate-400">
          <Info size={14} className="mt-0.5 shrink-0 text-cyan-500" />
          <p>{template.psychology}</p>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-700/50 flex flex-wrap gap-2">
         {template.graphicElements.map((el, i) => (
           <span key={i} className="text-[10px] px-2 py-1 bg-slate-700/50 rounded-full text-slate-300">
             {el}
           </span>
         ))}
      </div>
    </div>
  );
};