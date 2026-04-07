
export interface ProcessedImage {
  id: string;
  originalName: string;
  filename: string;
  dataUrl: string;
  originalSize: number;
  processedSize: number;
  width: number;
  height: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  history: string[]; // 적용된 변환 내역 리스트
}

export interface ProcessingOptions {
  exif: boolean;
  resize: boolean;
  noise: boolean;
  colorTemp: boolean;
  rotation: boolean;
  quality: boolean;
  brightness: boolean;
  imageResize: boolean;
  faceMosaic: boolean;
  plateMosaic: boolean;
}

export interface ResizeSettings {
  mode: 'fileSize' | 'dimensions';
  dimensionTarget: 'width' | 'height';
  maxFileSize: number; // KB
  maxWidth: number;
  maxHeight: number;
}

export interface MosaicSettings {
  level: number;
  type: 'pixelate' | 'blur' | 'black';
  padding: number;
  sensitivity: number;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'tech';
}
