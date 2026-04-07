
import React from 'react';
import { ProcessedImage } from '../types';
import { Download, CheckCircle, Clock, Info } from 'lucide-react';

interface ImageGridProps {
  items: ProcessedImage[];
  pendingCount: number;
}

const ImageGrid: React.FC<ImageGridProps> = ({ items, pendingCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: pendingCount }).map((_, i) => (
        <div key={`pending-${i}`} className="bg-slate-800/20 border border-slate-700/50 rounded-2xl overflow-hidden aspect-[4/3] flex flex-col animate-in fade-in duration-500">
          <div className="flex-1 bg-slate-800/40 animate-pulse flex items-center justify-center relative">
            <Clock className="text-slate-700 animate-spin" size={32} />
          </div>
          <div className="p-4 bg-slate-800/50 border-t border-slate-700">
            <div className="h-3 w-2/3 bg-slate-700 rounded animate-pulse mb-2" />
            <div className="h-2 w-1/3 bg-slate-700/50 rounded animate-pulse" />
          </div>
        </div>
      ))}

      {items.map((img) => (
        <div 
          key={img.id} 
          className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:border-emerald-500/50 transition-all shadow-xl hover:shadow-emerald-500/10 animate-in zoom-in-95 duration-300"
        >
          <div className="relative aspect-video bg-slate-950 overflow-hidden">
            <img 
              src={img.dataUrl} 
              alt={img.filename} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
               <a 
                 href={img.dataUrl} 
                 download={img.filename}
                 className="p-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-400 hover:scale-110 transition-all shadow-lg active:scale-90"
                 title="개별 다운로드"
               >
                 <Download size={20} />
               </a>
            </div>
            <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-500 text-[10px] font-black text-white rounded-lg flex items-center gap-1 uppercase tracking-tighter shadow-lg">
              <CheckCircle size={10} /> 변환완료
            </div>
          </div>
          
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-black text-slate-100 truncate">{img.filename}</p>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>{img.width}x{img.height}px</span>
                <span className="text-emerald-500/80">{(img.processedSize / 1024).toFixed(1)} KB</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-slate-800/50">
              <div className="flex items-center gap-1.5 mb-2">
                <Info size={10} className="text-slate-500" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">실행된 변환 내역</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {img.history.map((action, idx) => (
                  <HistoryBadge key={idx} label={action} />
                ))}
                {img.history.length === 0 && <span className="text-[9px] text-slate-600 italic">변경사항 없음</span>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const HistoryBadge: React.FC<{ label: string }> = ({ label }) => (
  <span className="px-1.5 py-0.5 bg-slate-800 text-[8px] font-bold text-slate-300 rounded uppercase border border-slate-700/50 tracking-tighter">
    {label.split(' (')[0]} {/* 괄호 이전 텍스트만 뱃지로 표시 */}
  </span>
);

export default ImageGrid;
