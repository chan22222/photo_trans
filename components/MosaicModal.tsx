
import React from 'react';
import { X, Sliders, Shield, Zap, Target } from 'lucide-react';
import { MosaicSettings } from '../types';

interface MosaicModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  settings: MosaicSettings;
  setSettings: React.Dispatch<React.SetStateAction<MosaicSettings>>;
  hasSensitivity?: boolean;
}

const MosaicModal: React.FC<MosaicModalProps> = ({ isOpen, onClose, title, settings, setSettings, hasSensitivity }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800/80 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-3">
            <Shield size={18} className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> {title}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors text-xl">
            <X size={16} />
          </button>
        </div>

        <div className="p-8 flex flex-col gap-8">
          
          {/* 강도 조절 */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Sliders size={12} className="text-emerald-500" /> 마스크 강도
              </label>
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">{settings.level}px</span>
            </div>
            <input 
              type="range" 
              min="5" max="80" 
              value={settings.level} 
              onChange={(e) => setSettings(s => ({ ...s, level: parseInt(e.target.value) }))}
              className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* 마스킹 타입 */}
          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">마스킹 방식 선택</label>
            <div className="grid grid-cols-3 gap-2">
              {(['pixelate', 'blur', 'black'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSettings(s => ({ ...s, type }))}
                  className={`px-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${settings.type === type ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'}`}
                >
                  {type === 'pixelate' ? '모자이크' : type === 'blur' ? '블러' : '블랙박스'}
                </button>
              ))}
            </div>
          </div>

          {/* 패딩 조절 */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Target size={12} className="text-emerald-500" /> 영역 확장 범위
              </label>
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">{settings.padding}%</span>
            </div>
            <input 
              type="range" 
              min="0" max="100" 
              value={settings.padding} 
              onChange={(e) => setSettings(s => ({ ...s, padding: parseInt(e.target.value) }))}
              className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* 인식 민감도 */}
          {hasSensitivity && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={12} className="text-emerald-500" /> 데이터 인식 민감도
                </label>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">{settings.sensitivity}%</span>
              </div>
              <input 
                type="range" 
                min="10" max="95" 
                value={settings.sensitivity} 
                onChange={(e) => setSettings(s => ({ ...s, sensitivity: parseInt(e.target.value) }))}
                className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          )}

          <button 
            onClick={onClose}
            className="w-full py-4 mt-2 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all shadow-xl"
          >
            설정값 적용하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MosaicModal;
