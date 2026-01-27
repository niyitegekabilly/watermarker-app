export type WatermarkType = 'text' | 'logo';
export type Position = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface WatermarkSettings {
  type: WatermarkType;
  // Text Settings
  text: string;
  fontFamily: string;
  fontSize: number; // Percentage of image height (1-20)
  color: string;
  stroke: boolean;
  strokeColor: string;
  
  // Logo Settings
  logoFile: File | null;
  logoUrl: string | null;
  logoScale: number; // Percentage of image width (1-100)
  logoShadow: boolean;
  logoShadowColor: string;
  
  // Common Settings
  opacity: number; // 0-100
  rotation: number; // -180 to 180
  position: Position;
  margin: number; // Percentage of shortest edge
  tiled: boolean;
  tileSpacing: number; // Percentage of width
  
  // Export Settings
  format: OutputFormat;
  quality: number; // 0-1
}

export interface ProcessedFile {
  id: string;
  originalFile: File;
  previewUrl: string;
  status: 'idle' | 'processing' | 'done' | 'error';
  processedBlob?: Blob;
  errorMsg?: string;
}

export const DEFAULT_SETTINGS: WatermarkSettings = {
  type: 'text',
  text: '© VJN_2026',
  fontFamily: 'Arial, sans-serif',
  fontSize: 5, // Increased slightly as height is often smaller than width in landscape
  color: '#ffffff',
  stroke: true,
  strokeColor: '#000000',
  logoFile: null,
  logoUrl: null,
  logoScale: 20,
  logoShadow: false,
  logoShadowColor: '#000000',
  opacity: 80, 
  rotation: 0,
  position: 'bottom-right',
  margin: 3,
  tiled: false,
  tileSpacing: 20,
  format: 'image/jpeg',
  quality: 0.92,
};