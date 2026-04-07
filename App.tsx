
import React, { useState, useCallback, useEffect } from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  RefreshCcw, 
  Layers, 
  LayoutGrid,
  Monitor
} from 'lucide-react';
import { ProcessedImage, ProcessingOptions, MosaicSettings, LogEntry, ResizeSettings } from './types';
import Sidebar from './components/Sidebar';
import Console from './components/Console';
import ImageGrid from './components/ImageGrid';
import MosaicModal from './components/MosaicModal';
import { processImageLogic, loadFaceModels, loadOpenCV } from './services/imageProcessor';
import JSZip from 'jszip';

const DEFAULTS = {
  options: {
    exif: true, resize: true, noise: true, colorTemp: true,
    rotation: true, quality: true, brightness: true, imageResize: true,
    faceMosaic: false, plateMosaic: false
  } as ProcessingOptions,
  brightnessRange: { min: -1, max: 1 },
  resizeSettings: { mode: 'dimensions', dimensionTarget: 'width', maxFileSize: 1024, maxWidth: 1920, maxHeight: 1080 } as ResizeSettings,
  faceSettings: { level: 30, type: 'pixelate', padding: 10, sensitivity: 20 } as MosaicSettings,
  plateSettings: { level: 15, type: 'pixelate', padding: 5, sensitivity: 20 } as MosaicSettings,
};

function loadSaved<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [options, setOptions] = useState<ProcessingOptions>(() => loadSaved('imagestrip:options', DEFAULTS.options));
  const [brightnessRange, setBrightnessRange] = useState<{ min: number; max: number }>(() => loadSaved('imagestrip:brightnessRange', DEFAULTS.brightnessRange));
  const [resizeSettings, setResizeSettings] = useState<ResizeSettings>(() => loadSaved('imagestrip:resizeSettings', DEFAULTS.resizeSettings));
  const [faceSettings, setFaceSettings] = useState<MosaicSettings>(() => loadSaved('imagestrip:faceSettings', DEFAULTS.faceSettings));
  const [plateSettings, setPlateSettings] = useState<MosaicSettings>(() => loadSaved('imagestrip:plateSettings', DEFAULTS.plateSettings));

  useEffect(() => { localStorage.setItem('imagestrip:options', JSON.stringify(options)); }, [options]);
  useEffect(() => { localStorage.setItem('imagestrip:brightnessRange', JSON.stringify(brightnessRange)); }, [brightnessRange]);
  useEffect(() => { localStorage.setItem('imagestrip:resizeSettings', JSON.stringify(resizeSettings)); }, [resizeSettings]);
  useEffect(() => { localStorage.setItem('imagestrip:faceSettings', JSON.stringify(faceSettings)); }, [faceSettings]);
  useEffect(() => { localStorage.setItem('imagestrip:plateSettings', JSON.stringify(plateSettings)); }, [plateSettings]);
  
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [isPlateModalOpen, setIsPlateModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mainLogs, setMainLogs] = useState<LogEntry[]>([]);
  const [processLogs, setProcessLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState(0);

  const addMainLog = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
    setMainLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: msg, type }]);
  }, []);

  const addProcessLog = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
    setProcessLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: msg, type }]);
  }, []);

  useEffect(() => {
    addMainLog('시스템 준비 완료. 보안 프로토콜이 활성화되었습니다.', 'success');
  }, [addMainLog]);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles: File[] = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(f => f.type.startsWith('image/'));
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      addMainLog(`${validFiles.length}개의 파일이 대기열에 추가되었습니다.`, 'info');
    }
  };

  const startProcessing = async () => {
    if (files.length === 0 || isProcessing) return;
    setIsProcessing(true);
    setProgress(0);
    addMainLog('이미지 일괄 변환 시퀀스를 시작합니다.', 'warning');
    
    if (options.faceMosaic) {
      addProcessLog('신경망 비전 모델 로드 중...', 'tech');
      await loadFaceModels();
    }
    if (options.plateMosaic) {
      addProcessLog('컴퓨터 비전 엔진 초기화 중...', 'tech');
      await loadOpenCV();
    }

    const currentFiles = [...files];
    for (let i = 0; i < currentFiles.length; i++) {
      const file = currentFiles[i];
      const id = Math.random().toString(36).substring(2, 9);
      addProcessLog(`[${i+1}/${currentFiles.length}] 대상 분석: ${file.name}`, 'info');
      
      try {
        const result = await processImageLogic(
          file,
          options,
          brightnessRange,
          resizeSettings,
          faceSettings,
          plateSettings,
          (msg) => addProcessLog(msg, 'tech')
        );
        
        const processed: ProcessedImage = {
          id,
          originalName: file.name,
          filename: result.filename,
          dataUrl: result.dataUrl,
          originalSize: file.size,
          processedSize: result.size,
          width: result.width,
          height: result.height,
          status: 'completed',
          history: result.appliedActions
        };
        
        setProcessedImages(prev => [processed, ...prev]);
        setProgress(Math.round(((i + 1) / currentFiles.length) * 100));
        addMainLog(`✓ 변환 완료: ${result.filename}`, 'success');
        
        result.appliedActions.forEach(action => addProcessLog(`> ${action}`, 'tech'));
        
      } catch (err: any) {
        addMainLog(`✕ 변환 실패: ${file.name}`, 'error');
        addProcessLog(`치명적 오류 발생: ${err.message}`, 'error');
      }
    }
    
    setIsProcessing(false);
    setFiles([]);
    addMainLog('모든 변환 프로토콜이 성공적으로 종료되었습니다.', 'success');
  };

  const downloadAllZip = async () => {
    if (processedImages.length === 0) return;
    addMainLog('결과물 압축 파일 생성 중...', 'info');
    const zip = new JSZip();
    processedImages.forEach(img => {
      const base64Data = img.dataUrl.split(',')[1];
      zip.file(img.filename, base64Data, { base64: true });
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted_images_${Date.now()}.zip`;
    link.click();
    addMainLog('ZIP 아카이브 내보내기 완료.', 'success');
  };

  const downloadSequentially = async () => {
    if (processedImages.length === 0) return;
    addMainLog('순차적 개별 다운로드를 시작합니다...', 'info');
    for (const img of processedImages) {
      const link = document.createElement('a');
      link.href = img.dataUrl;
      link.download = img.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    addMainLog('순차 다운로드 작업이 완료되었습니다.', 'success');
  };

  const resetAll = () => {
    setFiles([]);
    setProcessedImages([]);
    setMainLogs([]);
    setProcessLogs([]);
    setProgress(0);
    addMainLog('모든 작업 내역과 임시 데이터가 초기화되었습니다.', 'warning');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <Sidebar
        options={options}
        setOptions={setOptions}
        brightnessRange={brightnessRange}
        setBrightnessRange={setBrightnessRange}
        resizeSettings={resizeSettings}
        setResizeSettings={setResizeSettings}
        onFaceSettings={() => setIsFaceModalOpen(true)}
        onPlateSettings={() => setIsPlateModalOpen(true)}
        onUpload={handleFileSelection}
        onStart={startProcessing}
        onReset={resetAll}
        onDownloadZip={downloadAllZip}
        onDownloadSequential={downloadSequentially}
        isProcessing={isProcessing}
        hasFiles={files.length > 0}
        hasProcessed={processedImages.length > 0}
      />

      <main className="flex-1 flex flex-col p-6 overflow-hidden gap-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
              <ShieldCheck className="text-emerald-500 w-10 h-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              IMAGE<span className="text-emerald-500">STRIP</span>
              <span className="ml-2 px-2 py-0.5 bg-slate-800 rounded text-[10px] tracking-widest text-slate-400 font-bold border border-slate-700 uppercase">Pro Edition</span>
            </h1>
            <p className="text-slate-500 text-xs mt-1 font-medium tracking-tight">사진 개인정보와 메타데이터를 제거하여 추적을 방지하고 다량의 이미지를 안전하게 일괄 변환합니다.</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">일괄 처리 진행률</span>
            <div className="w-64 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 gap-6 overflow-hidden">
          <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
            <Console title="시스템 이벤트 로그" icon={<Terminal size={14}/>} logs={mainLogs} />
            <Console title="프로세스 모니터 (상세 분석)" icon={<Monitor size={14}/>} logs={processLogs} variant="tech" />
          </div>

          <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800/60 rounded-3xl flex flex-col overflow-hidden relative shadow-2xl backdrop-blur-xl">
             <div className="p-5 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/60">
                <span className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                  <LayoutGrid size={14} className="text-emerald-500" /> 변환 결과 버퍼
                </span>
                <div className="flex gap-4">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">{processedImages.length}개의 파일 변환 완료</span>
                </div>
             </div>
             <div className="flex-1 p-6 overflow-y-auto">
               {processedImages.length === 0 && files.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-6 opacity-30">
                    <Layers size={80} strokeWidth={0.5} />
                    <p className="text-sm font-bold uppercase tracking-[0.2em]">처리 대기 중인 이미지가 없습니다</p>
                 </div>
               ) : (
                 <ImageGrid items={processedImages} pendingCount={files.length} />
               )}
             </div>
          </div>
        </div>
      </main>

      <MosaicModal 
        isOpen={isFaceModalOpen} 
        onClose={() => setIsFaceModalOpen(false)}
        title="AI 얼굴 인식 변환 설정"
        settings={faceSettings}
        setSettings={setFaceSettings}
        hasSensitivity={true}
      />
      <MosaicModal 
        isOpen={isPlateModalOpen} 
        onClose={() => setIsPlateModalOpen(false)}
        title="번호판 인식 변환 설정"
        settings={plateSettings}
        setSettings={setPlateSettings}
        hasSensitivity={true}
      />
    </div>
  );
};

export default App;
