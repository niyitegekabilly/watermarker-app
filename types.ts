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

// Placeholder SVG representation of the VJN Logo (Soccer ball + Text)
// Replace this string with the actual Base64 of your PNG/JPG if you want the exact pixel-perfect image.
export const DEFAULT_LOGO = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KICA8IS0tIEJhY2tncm91bmQgLS0+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI5NSIgZmlsbD0id2hpdGUiIHN0cm9rZT0iIzAwNDRjYyIHN0cm9rZS13aWR0aD0iNCIvPgogIAogIDwhLS0gU29jY2VyIEJhbGwgUGF0dGVybiAoU2ltcGxpZmllZCkgLS0+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI3MCIgZmlsbD0iI2YwZjBmMCIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8cGF0aCBkPSJNMTAwLDYwIEw4MCw4NSBMMTAwLDExMCBMMTIwLDg1IFoiIGZpbGw9IiMzMzMiLz4KICA8cGF0aCBkPSJNMTAwLDExMCBMODAsMTM1IEwxMjAsMTM1IFoiIGZpbGw9IiMzMzMiLz4KICA8cGF0aCBkPSJNMzAsMTAwIEw1MCw4MCBMNTAsMTIwIFoiIGZpbGw9IiMzMzMiLz4KICA8cGF0aCBkPSJNMTcwLDEwMCBMMTUwLDgwIEwxNTAsMTIwIFoiIGZpbGw9IiMzMzMiLz4KCiAgPCEtLSBUZXh0IC0tPgogIDxwYXRoIGlkPSJjdXJ2ZVRvcCIgZD0iTSAyMCAxMDAgQSA4MCA4MCAwIDAgMSAxODAgMTAwIiBmaWxsPSJub25lIiAvPgogIDx0ZXh0IHdpZHRoPSIyMDAiIGZpbGw9IiMwMDQ0Y2MiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iMjIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPgogICAgPHRleHRQYXRoIHhsaW5rOmhyZWY9IiNjdXJ2ZVRvcCIgc3RhcnRPZmZzZXQ9IjUwJSI+CiAgICAgIFZJU0lPTiBKRVRORVNTRSBOT1VWRUxMRQogICAgPC90ZXh0UGF0aD4KICA8L3RleHQ+CgogIDx0ZXh0IHg9IjEwMCIgeT0iMTY1IiBmaWxsPSIjMDA0NGNjIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjMyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5WSk48L3RleHQ+Cjwvc3ZnPg==`;

export const DEFAULT_SETTINGS: WatermarkSettings = {
  type: 'logo', // Default to Logo
  text: '© VJN_2026',
  fontFamily: 'Arial, sans-serif',
  fontSize: 5,
  color: '#ffffff',
  stroke: true,
  strokeColor: '#000000',
  logoFile: null,
  logoUrl: DEFAULT_LOGO, // Use the default VJN logo
  logoScale: 18, // Slightly smaller for better default appearance
  logoShadow: false,
  logoShadowColor: '#000000',
  opacity: 90, // Logos usually look better with higher opacity
  rotation: 0,
  position: 'bottom-right',
  margin: 3,
  tiled: false,
  tileSpacing: 20,
  format: 'image/jpeg',
  quality: 0.92,
};