
import React from 'react';
import { 
  Upload, 
  Settings, 
  Play, 
  Trash2, 
  Eye, 
  RefreshCcw,
  SlidersHorizontal,
  Archive,
  ArrowDownToLine,
  Sun,
  AlertTriangle,
  CheckSquare,
  Square
} from 'lucide-react';
import { ProcessingOptions, ResizeSettings } from '../types';

interface SidebarProps {
  options: ProcessingOptions;
  setOptions: React.Dispatch<React.SetStateAction<ProcessingOptions>>;
  brightnessRange: { min: number; max: number };
  setBrightnessRange: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>;
  resizeSettings: ResizeSettings;
  setResizeSettings: React.Dispatch<React.SetStateAction<ResizeSettings>>;
  onFaceSettings: () => void;
  onPlateSettings: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStart: () => void;
  onReset: () => void;
  onDownloadZip: () => void;
  onDownloadSequential: () => void;
  isProcessing: boolean;
  hasFiles: boolean;
  hasProcessed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  options,
  setOptions,
  brightnessRange,
  setBrightnessRange,
  resizeSettings,
  setResizeSettings,
  onFaceSettings,
  onPlateSettings,
  onUpload,
  onStart,
  onReset,
  onDownloadZip,
  onDownloadSequential,
  isProcessing,
  hasFiles,
  hasProcessed
}) => {
  const toggleOption = (key: keyof ProcessingOptions) => {
    setOptions(prev => {
      const isTurningOn = !prev[key];
      // 밝기 및 대비 조절을 켤 때 초기값으로 리셋
      if (key === 'brightness' && isTurningOn) {
        setBrightnessRange({ min: -1, max: 1 });
      }
      return { ...prev, [key]: isTurningOn };
    });
  };

  const toggleAllCore = () => {
    const coreKeys: (keyof ProcessingOptions)[] = [
      'exif', 'resize', 'noise', 'colorTemp', 'rotation', 'quality', 'brightness', 'imageResize'
    ];
    const anyOn = coreKeys.some(key => options[key]);
    const newState = !anyOn;
    
    setOptions(prev => {
      const updated = { ...prev };
      coreKeys.forEach(key => { 
        updated[key] = newState; 
      });
      if (newState) {
        setBrightnessRange({ min: -1, max: 1 });
      }
      return updated;
    });
  };

  return (
    <aside className="w-80 bg-slate-900/95 border-r border-slate-800 flex flex-col overflow-y-auto backdrop-blur-xl">
      <div className="p-6 flex flex-col gap-6 h-full">
        
        <section>
          <div className="group relative">
            <input 
              type="file" 
              multiple 
              onChange={onUpload} 
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              accept="image/*"
            />
            <div className="border-2 border-dashed border-slate-700 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/5 transition-all rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 group-hover:scale-110 transition-all shadow-inner">
                <Upload size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">대량 이미지 업로드</p>
                <p className="text-[9px] text-slate-500 font-bold">이미지 파일을 드래그하여 대기열 추가</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-2 pt-6 border-t border-slate-800/60">
           <button
             disabled={!hasFiles || isProcessing}
             onClick={onStart}
             className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-900/40 active:scale-95"
           >
             {isProcessing ? <RefreshCcw className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
             이미지 일괄 변환 시작
           </button>

           <div className="grid grid-cols-2 gap-2">
              <button
                disabled={!hasProcessed || isProcessing}
                onClick={onDownloadZip}
                className="py-3 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-slate-700"
                title="모든 결과물을 ZIP 아카이브로 다운로드"
              >
                <Archive size={14} /> ZIP 압축
              </button>
              <button
                disabled={!hasProcessed || isProcessing}
                onClick={onDownloadSequential}
                className="py-3 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-slate-700"
                title="브라우저를 통해 개별 파일을 순차적으로 다운로드"
              >
                <ArrowDownToLine size={14} /> 순차 저장
              </button>
           </div>

           <button
             onClick={onReset}
             className="py-3 px-4 bg-transparent hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2"
           >
             <Trash2 size={14} /> 대기열 초기화
           </button>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Settings size={12} className="text-emerald-500" /> 핵심 변환 알고리즘
            </h3>
            <button 
              onClick={toggleAllCore}
              className="text-[9px] font-black text-emerald-500/60 hover:text-emerald-500 uppercase tracking-tighter transition-colors flex items-center gap-1"
            >
              {Object.keys(options).filter(k => ['exif', 'resize', 'noise', 'colorTemp', 'rotation', 'quality', 'brightness', 'imageResize'].includes(k)).some(k => (options as any)[k]) 
                ? <><Square size={10} /> 전체 해제</> 
                : <><CheckSquare size={10} /> 전체 선택</>
              }
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <div className={`flex flex-col gap-2 p-1 rounded-2xl transition-all ${options.imageResize ? 'bg-slate-800/40 border border-slate-700/50' : ''}`}>
              <OptionToggle label="이미지 사이즈 변환" active={options.imageResize} onClick={() => toggleOption('imageResize')} border={false} />
              {options.imageResize && (
                <div className="px-3 pb-3 space-y-3 animate-in slide-in-from-top-1 duration-200">
                  <div className="flex gap-1 bg-slate-900 rounded-lg p-0.5">
                    <button
                      onClick={() => setResizeSettings(prev => ({ ...prev, mode: 'dimensions' }))}
                      className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${resizeSettings.mode === 'dimensions' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-400'}`}
                    >
                      사이즈
                    </button>
                    <button
                      onClick={() => setResizeSettings(prev => ({ ...prev, mode: 'fileSize' }))}
                      className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${resizeSettings.mode === 'fileSize' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-400'}`}
                    >
                      용량
                    </button>
                  </div>

                  {resizeSettings.mode === 'dimensions' ? (
                    <div className="space-y-2">
                      <div className="flex gap-1 bg-slate-900 rounded-lg p-0.5">
                        <button
                          onClick={() => setResizeSettings(prev => ({ ...prev, dimensionTarget: 'width' }))}
                          className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${resizeSettings.dimensionTarget === 'width' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-400'}`}
                        >
                          가로 기준
                        </button>
                        <button
                          onClick={() => setResizeSettings(prev => ({ ...prev, dimensionTarget: 'height' }))}
                          className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${resizeSettings.dimensionTarget === 'height' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-400'}`}
                        >
                          세로 기준
                        </button>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          최대 {resizeSettings.dimensionTarget === 'width' ? '가로' : '세로'} (px)
                        </label>
                        <input
                          type="number"
                          value={resizeSettings.dimensionTarget === 'width' ? resizeSettings.maxWidth : resizeSettings.maxHeight}
                          onChange={(e) => {
                            const val = Math.max(1, parseInt(e.target.value) || 1);
                            setResizeSettings(prev => ({
                              ...prev,
                              ...(prev.dimensionTarget === 'width' ? { maxWidth: val } : { maxHeight: val })
                            }));
                          }}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-emerald-400 font-mono focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <p className="text-[8px] text-slate-600 italic leading-tight">비율을 유지하며 축소합니다. 목표보다 작으면 원본 유지.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">최대 용량 (KB)</label>
                        <input
                          type="number"
                          value={resizeSettings.maxFileSize}
                          onChange={(e) => setResizeSettings(prev => ({ ...prev, maxFileSize: Math.max(1, parseInt(e.target.value) || 1) }))}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-emerald-400 font-mono focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <p className="text-[8px] text-slate-600 italic leading-tight">목표보다 작은 파일은 원본 용량을 유지합니다.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={`flex flex-col gap-2 p-1 rounded-2xl transition-all ${options.brightness ? 'bg-slate-800/40 border border-slate-700/50' : ''}`}>
              <OptionToggle label="밝기 및 대비 조절" active={options.brightness} onClick={() => toggleOption('brightness')} border={false} />
              {options.brightness && (
                <div className="px-3 pb-3 space-y-4 animate-in slide-in-from-top-1 duration-200">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        최소 변동값
                      </label>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">{brightnessRange.min}%</span>
                    </div>
                    <input
                      type="range"
                      min="-50" max="50"
                      value={brightnessRange.min}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setBrightnessRange(prev => ({ ...prev, min: val, max: Math.max(val, prev.max) }));
                      }}
                      className="w-full h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        최대 변동값
                      </label>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">{brightnessRange.max}%</span>
                    </div>
                    <input
                      type="range"
                      min="-50" max="50"
                      value={brightnessRange.max}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setBrightnessRange(prev => ({ ...prev, max: val, min: Math.min(val, prev.min) }));
                      }}
                      className="w-full h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                  <p className="text-[8px] text-slate-600 italic leading-tight">설정된 범위 내에서 랜덤하게 조절됩니다.</p>
                </div>
              )}
            </div>

            <OptionToggle label="EXIF 메타데이터 삭제" active={options.exif} onClick={() => toggleOption('exif')} />
            <OptionToggle label="해상도 미세 변조" active={options.resize} onClick={() => toggleOption('resize')} />
            <OptionToggle label="엔트로피 노이즈 주입" active={options.noise} onClick={() => toggleOption('noise')} />
            <OptionToggle label="색온도 무작위 보정" active={options.colorTemp} onClick={() => toggleOption('colorTemp')} />
            <OptionToggle label="회전값 무작위 변환" active={options.rotation} onClick={() => toggleOption('rotation')} />
            <OptionToggle label="JPEG 양자화 랜덤화" active={options.quality} onClick={() => toggleOption('quality')} />
          </div>
        </section>

        <section className="flex flex-col gap-3 pb-6">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
            <Eye size={12} className="text-emerald-500" /> 신경망 마스킹 (프라이버시)
          </h3>
          <div className="flex flex-col gap-2">
             <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${options.faceMosaic ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/40 border-slate-700/50'}`}>
                <div className="flex flex-col gap-1.5">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${options.faceMosaic ? 'text-emerald-400' : 'text-slate-400'}`}>AI 얼굴 마스킹</span>
                  <button 
                    onClick={onFaceSettings} 
                    className="w-fit px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500 hover:text-white text-[9px] text-emerald-300 rounded-md flex items-center gap-1 font-bold uppercase border border-emerald-500/30 transition-all shadow-sm"
                  >
                    <SlidersHorizontal size={10} /> 변환 설정
                  </button>
                </div>
                <button 
                  onClick={() => toggleOption('faceMosaic')}
                  className={`w-10 h-5 rounded-full p-1 transition-colors ${options.faceMosaic ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${options.faceMosaic ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
             </div>
             
             <div className={`p-3 rounded-2xl border transition-all flex flex-col gap-3 ${options.plateMosaic ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/40 border-slate-700/50'}`}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-black uppercase tracking-wider ${options.plateMosaic ? 'text-emerald-400' : 'text-slate-400'}`}>번호판 마스킹</span>
                      <span className="px-1 py-0.5 bg-amber-500/20 text-amber-500 text-[8px] font-black rounded border border-amber-500/30 uppercase">BETA</span>
                    </div>
                    <button 
                      onClick={onPlateSettings} 
                      className="w-fit px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500 hover:text-white text-[9px] text-emerald-300 rounded-md flex items-center gap-1 font-bold uppercase border border-emerald-500/30 transition-all shadow-sm"
                    >
                      <SlidersHorizontal size={10} /> 변환 설정
                    </button>
                  </div>
                  <button 
                    onClick={() => toggleOption('plateMosaic')}
                    className={`w-10 h-5 rounded-full p-1 transition-colors ${options.plateMosaic ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${options.plateMosaic ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                {options.plateMosaic && (
                  <div className="flex items-start gap-1.5 p-2 bg-amber-500/5 border border-amber-500/10 rounded-lg animate-in fade-in duration-300">
                    <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-amber-200/70 font-medium leading-tight">신경망 특성상 각도에 따라 탐색이 불안정할 수 있으므로 최종 검토를 권장합니다.</p>
                  </div>
                )}
             </div>
          </div>
        </section>
      </div>
    </aside>
  );
};

const OptionToggle: React.FC<{ label: string; active: boolean; onClick: () => void; border?: boolean }> = ({ label, active, onClick, border = true }) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-between p-3 rounded-xl transition-all ${border ? 'border' : ''} ${active ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-800/30 border-slate-700/50 text-slate-500 hover:border-slate-600'}`}
  >
    <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
    <div className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]' : 'bg-slate-700'}`} />
  </button>
);

export default Sidebar;
