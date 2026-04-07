
import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';

interface ConsoleProps {
  title: string;
  icon: React.ReactNode;
  logs: LogEntry[];
  variant?: 'default' | 'tech';
}

const Console: React.FC<ConsoleProps> = ({ title, icon, logs, variant = 'default' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">{icon}</span>
          <h4 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{title}</h4>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700 opacity-50" />
        </div>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-[10px] leading-relaxed scroll-smooth scrollbar-thin"
      >
        {logs.length === 0 ? (
          <div className="text-slate-700 animate-pulse italic">대기열 분석기 활성화 중...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="mb-2 flex flex-col gap-0.5 border-l border-slate-800 pl-3 group">
              <span className="text-slate-600 text-[9px] select-none opacity-60">
                {log.timestamp}
              </span>
              <span className={`
                break-all whitespace-pre-wrap pr-2
                ${log.type === 'success' ? 'text-emerald-400' : ''}
                ${log.type === 'error' ? 'text-rose-400 font-bold' : ''}
                ${log.type === 'warning' ? 'text-amber-400' : ''}
                ${log.type === 'tech' ? 'text-blue-400/80' : ''}
                ${log.type === 'info' ? 'text-slate-300' : ''}
              `}>
                <span className="opacity-50 inline-block w-4 shrink-0">{variant === 'tech' ? 'λ' : '▶'}</span>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Console;
