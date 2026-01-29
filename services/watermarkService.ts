import { WatermarkSettings, Position } from '../types';

/**
 * Loads an image from a URL or Blob into an HTMLImageElement
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image'));
    img.src = src;
  });
};

/**
 * Calculates coordinates based on 9-grid position
 */
const getPositionCoords = (
  pos: Position,
  imgWidth: number,
  imgHeight: number,
  wmWidth: number,
  wmHeight: number,
  marginPx: number
): { x: number; y: number } => {
  let x = 0;
  let y = 0;

  // X Axis
  if (pos.includes('left')) x = marginPx;
  else if (pos.includes('right')) x = imgWidth - wmWidth - marginPx;
  else x = (imgWidth - wmWidth) / 2;

  // Y Axis
  if (pos.includes('top')) y = marginPx;
  else if (pos.includes('bottom')) y = imgHeight - wmHeight - marginPx;
  else y = (imgHeight - wmHeight) / 2;

  return { x, y };
};

/**
 * Main function to apply watermark to a single image
 */
export const applyWatermark = async (
  imageFile: File,
  settings: WatermarkSettings
): Promise<Blob> => {
  const imageUrl = URL.createObjectURL(imageFile);
  
  try {
    const img = await loadImage(imageUrl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Could not get canvas context');

    // set canvas size to match original image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw original image
    ctx.drawImage(img, 0, 0);

    ctx.save();

    const shortestEdge = Math.min(img.width, img.height);
    const marginPx = (settings.margin / 100) * shortestEdge;
    const opacityVal = settings.opacity / 100;
    
    // Configure common styles
    ctx.globalAlpha = opacityVal;

    // --- Prepare Content Dimensions ---
    let wmWidth = 0;
    let wmHeight = 0;
    let drawContent: (x: number, y: number) => void;

    if (settings.type === 'text') {
      const fontSizePx = (settings.fontSize / 100) * img.height;
      ctx.font = `bold ${fontSizePx}px ${settings.fontFamily}`;
      ctx.textBaseline = 'top';
      const metrics = ctx.measureText(settings.text);
      wmWidth = metrics.width;
      // Approximate height for text
      wmHeight = fontSizePx;

      drawContent = (x, y) => {
        ctx.save();
        
        // Translate to center of the tile
        ctx.translate(x + wmWidth / 2, y + wmHeight / 2);
        ctx.rotate((settings.rotation * Math.PI) / 180);
        
        // Draw relative to center
        const drawX = -wmWidth / 2;
        const drawY = -wmHeight / 2;

        if (settings.stroke) {
          ctx.strokeStyle = settings.strokeColor;
          ctx.lineWidth = fontSizePx * 0.05;
          ctx.lineJoin = 'round';
          ctx.strokeText(settings.text, drawX, drawY);
        }
        ctx.fillStyle = settings.color;
        ctx.fillText(settings.text, drawX, drawY);
        
        ctx.restore();
      };

    } else {
      // LOGO
      if (!settings.logoUrl) throw new Error("No logo uploaded");
      const logoImg = await loadImage(settings.logoUrl);
      
      const targetWidth = (settings.logoScale / 100) * img.width;
      const scaleFactor = targetWidth / logoImg.width;
      wmWidth = targetWidth;
      wmHeight = logoImg.height * scaleFactor;

      drawContent = (x, y) => {
        ctx.save();
        
        // Translate to center
        const cx = x + wmWidth / 2;
        const cy = y + wmHeight / 2;

        ctx.translate(cx, cy);
        ctx.rotate((settings.rotation * Math.PI) / 180);

        if (settings.logoShadow) {
           ctx.shadowColor = settings.logoShadowColor;
           ctx.shadowBlur = 4;
           ctx.shadowOffsetX = 2;
           ctx.shadowOffsetY = 2;
        }

        ctx.drawImage(logoImg, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
        
        ctx.restore();
      };
    }

    // --- Render ---
    if (settings.tiled) {
       const spacingX = (settings.tileSpacing / 100) * img.width;
       const spacingY = spacingX; 
       
       // Calculate diagonal to determine safe rendering bounds for rotation
       // This ensures we draw elements that are partially off-screen but rotated into view
       const diagonal = Math.sqrt(wmWidth * wmWidth + wmHeight * wmHeight);
       
       // Add a buffer to ensuring we cover the edges completely
       const buffer = Math.max(diagonal, spacingX, spacingY);

       const stepX = wmWidth + spacingX;
       const stepY = wmHeight + spacingY;

       // Start from negative coordinates to ensure top/left edges are covered
       for (let y = -buffer; y < img.height + buffer; y += stepY) {
         for (let x = -buffer; x < img.width + buffer; x += stepX) {
            drawContent(x, y);
         }
       }
    } else {
      // Single placement
      const { x, y } = getPositionCoords(
        settings.position, 
        img.width, 
        img.height, 
        wmWidth, 
        wmHeight, 
        marginPx
      );
      drawContent(x, y);
    }

    ctx.restore();

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas conversion failed'));
        },
        settings.format,
        settings.quality
      );
    });

  } catch (err) {
    throw err;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};