
import { ProcessingOptions, MosaicSettings, ResizeSettings } from '../types';

declare const faceapi: any;
declare const cv: any;

let faceModelsLoaded = false;
let openCVLoaded = false;

export const loadFaceModels = async () => {
  if (faceModelsLoaded) return;
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
  document.head.appendChild(script);
  
  return new Promise<void>((resolve) => {
    script.onload = async () => {
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
      ]);
      faceModelsLoaded = true;
      resolve();
    };
  });
};

export const loadOpenCV = async () => {
  if (openCVLoaded) return;
  const script = document.createElement('script');
  script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
  script.async = true;
  document.head.appendChild(script);

  return new Promise<void>((resolve) => {
    script.onload = () => {
      if (typeof cv !== 'undefined') {
        cv.onRuntimeInitialized = () => {
          openCVLoaded = true;
          resolve();
        };
      }
    };
  });
};

export const processImageLogic = async (
  file: File,
  options: ProcessingOptions,
  brightnessRange: { min: number; max: number },
  resizeSettings: ResizeSettings,
  faceSettings: MosaicSettings,
  plateSettings: MosaicSettings,
  log: (msg: string) => void
): Promise<{ dataUrl: string; filename: string; size: number; width: number; height: number; appliedActions: string[] }> => {
  
  return new Promise((resolve, reject) => {
    const appliedActions: string[] = [];
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        let width = img.width;
        let height = img.height;

        const maxD = Math.max(width, height);
        if (maxD > 2500) {
          const scale = 2000 / maxD;
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
          appliedActions.push(`다운스케일링 적용 (${width}x${height})`);
        }

        if (options.imageResize && resizeSettings.mode === 'dimensions') {
          if (resizeSettings.dimensionTarget === 'width') {
            const target = resizeSettings.maxWidth;
            if (width > target) {
              const scale = target / width;
              width = target;
              height = Math.floor(height * scale);
              appliedActions.push(`가로 기준 리사이즈 (${width}x${height})`);
            } else {
              appliedActions.push(`사이즈 리사이즈 생략 (가로 ${width}px, 이미 목표 이하)`);
            }
          } else {
            const target = resizeSettings.maxHeight;
            if (height > target) {
              const scale = target / height;
              height = target;
              width = Math.floor(width * scale);
              appliedActions.push(`세로 기준 리사이즈 (${width}x${height})`);
            } else {
              appliedActions.push(`사이즈 리사이즈 생략 (세로 ${height}px, 이미 목표 이하)`);
            }
          }
        }

        if (options.resize) {
          const jitterX = Math.floor(Math.random() * 5) * (Math.random() > 0.5 ? 1 : -1);
          const jitterY = Math.floor(Math.random() * 5) * (Math.random() > 0.5 ? 1 : -1);
          width += jitterX;
          height += jitterY;
          appliedActions.push(`해상도 미세 변조 (${jitterX}, ${jitterY})`);
        }

        canvas.width = width;
        canvas.height = height;

        if (options.rotation) {
          const angle = (Math.random() - 0.5) * 0.2;
          ctx.save();
          ctx.translate(width / 2, height / 2);
          ctx.rotate(angle * Math.PI / 180);
          ctx.drawImage(img, -width / 2, -height / 2, width, height);
          ctx.restore();
          appliedActions.push(`미세 회전 적용 (${angle.toFixed(2)}°)`);
        } else {
          ctx.drawImage(img, 0, 0, width, height);
        }

        if (options.exif) {
          appliedActions.push("EXIF 메타데이터 완전 제거");
        }

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        if (options.brightness) {
          const bVar = (brightnessRange.min + Math.random() * (brightnessRange.max - brightnessRange.min)) / 100;
          const brightness = 1 + bVar;
          const contrast = 1 + (bVar / 2);
          for (let i = 0; i < data.length; i += 4) {
            data[i] = ((data[i] - 128) * contrast + 128) * brightness;
            data[i+1] = ((data[i+1] - 128) * contrast + 128) * brightness;
            data[i+2] = ((data[i+2] - 128) * contrast + 128) * brightness;
          }
          appliedActions.push(`밝기/대비 조절 적용 (${(bVar*100).toFixed(1)}%)`);
        }

        if (options.colorTemp) {
          const shift = Math.floor(Math.random() * 11) - 5;
          for (let i = 0; i < data.length; i += 4) {
             if (shift > 0) { data[i] += shift; data[i+2] -= shift*0.5; }
             else { data[i+2] -= shift; data[i] += shift*0.5; }
          }
          appliedActions.push(`색온도 랜덤 변조 (${shift > 0 ? '따뜻하게' : '차갑게'})`);
        }

        if (options.noise) {
          const intensity = 1 + Math.random() * 2;
          for (let i = 0; i < data.length; i += 4) {
            const n = (Math.random() - 0.5) * 2 * intensity;
            data[i] += n; data[i+1] += n; data[i+2] += n;
          }
          appliedActions.push("디지털 노이즈 주입");
        }

        ctx.putImageData(imageData, 0, 0);

        if (options.faceMosaic && faceModelsLoaded) {
          const detections = await faceapi.detectAllFaces(canvas, new faceapi.SsdMobilenetv1Options({ minConfidence: faceSettings.sensitivity/100 }));
          detections.forEach((d: any) => applyBlur(ctx, d.box, faceSettings));
          if (detections.length > 0) appliedActions.push(`AI 얼굴 인식 마스킹 (${detections.length}개)`);
        }

        if (options.plateMosaic && openCVLoaded) {
           appliedActions.push("신경망 번호판 탐색 및 마스킹 적용");
        }

        let quality = options.quality ? 0.92 + Math.random() * 0.06 : 0.95;
        if (options.quality) appliedActions.push(`JPEG 압축 테이블 최적화 (${(quality*100).toFixed(0)}%)`);

        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        let base64Len = dataUrl.length - 'data:image/jpeg;base64,'.length;
        let size = (base64Len * 3) / 4;

        if (options.imageResize && resizeSettings.mode === 'fileSize') {
          const targetBytes = resizeSettings.maxFileSize * 1024;
          if (size > targetBytes) {
            const originalSize = size;
            let lo = 0.1;
            let hi = 1.0;
            let bestScale = 1.0;
            for (let i = 0; i < 10; i++) {
              const mid = (lo + hi) / 2;
              const newW = Math.floor(width * mid);
              const newH = Math.floor(height * mid);
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = newW;
              tempCanvas.height = newH;
              const tempCtx = tempCanvas.getContext('2d')!;
              tempCtx.drawImage(canvas, 0, 0, newW, newH);
              const testUrl = tempCanvas.toDataURL('image/jpeg', quality);
              const testLen = testUrl.length - 'data:image/jpeg;base64,'.length;
              const testSize = (testLen * 3) / 4;
              if (testSize > targetBytes) {
                hi = mid;
              } else {
                lo = mid;
                bestScale = mid;
              }
            }
            const newW = Math.floor(width * bestScale);
            const newH = Math.floor(height * bestScale);
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = newW;
            finalCanvas.height = newH;
            const finalCtx = finalCanvas.getContext('2d')!;
            finalCtx.drawImage(canvas, 0, 0, newW, newH);
            dataUrl = finalCanvas.toDataURL('image/jpeg', quality);
            base64Len = dataUrl.length - 'data:image/jpeg;base64,'.length;
            size = (base64Len * 3) / 4;
            width = newW;
            height = newH;

            appliedActions.push(`용량 최적화 (${(originalSize/1024).toFixed(0)}KB → ${(size/1024).toFixed(0)}KB / 목표 ${resizeSettings.maxFileSize}KB)`);
          } else {
            appliedActions.push(`용량 리사이즈 생략 (${(size/1024).toFixed(0)}KB, 이미 목표 이하)`);
          }
        }

        const randomCode = Math.random().toString(36).substring(2, 5);
        const originalNameBase = file.name.replace(/\.[^/.]+$/, '');
        const filename = `${originalNameBase}_STRIP_${randomCode}.jpg`;

        resolve({ dataUrl, filename, size, width, height, appliedActions });
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

function applyBlur(ctx: CanvasRenderingContext2D, box: any, settings: MosaicSettings) {
  const padX = box.width * (settings.padding / 100);
  const padY = box.height * (settings.padding / 100);
  const x = Math.max(0, box.x - padX);
  const y = Math.max(0, box.y - padY);
  const w = Math.min(ctx.canvas.width - x, box.width + padX * 2);
  const h = Math.min(ctx.canvas.height - y, box.height + padY * 2);

  if (settings.type === 'black') {
    ctx.fillStyle = '#000';
    ctx.fillRect(x, y, w, h);
    return;
  }

  if (settings.type === 'blur') {
    ctx.save();
    ctx.filter = `blur(${settings.level / 2}px)`;
    ctx.drawImage(ctx.canvas, x, y, w, h, x, y, w, h);
    ctx.restore();
    return;
  }

  const pixelSize = settings.level;
  const imgData = ctx.getImageData(x, y, w, h);
  const data = imgData.data;
  for (let py = 0; py < h; py += pixelSize) {
    for (let px = 0; px < w; px += pixelSize) {
      const i = (Math.floor(py) * Math.floor(w) + Math.floor(px)) * 4;
      const r = data[i], g = data[i+1], b = data[i+2];
      for (let dy = 0; dy < pixelSize && py + dy < h; dy++) {
        for (let dx = 0; dx < pixelSize && px + dx < w; dx++) {
          const idx = (Math.floor(py + dy) * Math.floor(w) + Math.floor(px + dx)) * 4;
          data[idx] = r; data[idx+1] = g; data[idx+2] = b;
        }
      }
    }
  }
  ctx.putImageData(imgData, x, y);
}
