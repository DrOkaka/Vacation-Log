import { FilterPreset, InstagramStorySlide, InstagramSong } from '../types';

/**
 * Loads an image from a data URL or blob URL.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Compresses an uploaded image to a maximum dimension while maintaining quality.
 */
export async function compressImage(file: File, maxDim = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const img = await loadImage(e.target?.result as string);
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(img.src);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Applies a cinematic vacation filter to an image with soft highlight bloom and warm color grading.
 */
export async function applyFilterToImage(dataUrl: string, preset: FilterPreset = 'summer-glow'): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;

  // Base image draw
  ctx.drawImage(img, 0, 0);

  const w = canvas.width;
  const h = canvas.height;

  // Retrieve pixel data for color balance & contrast
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Parameters based on chosen preset
  let rMult = 1.0;
  let gMult = 1.0;
  let bMult = 1.0;
  let contrast = 1.0;
  let brightness = 0;
  let satBoost = 1.0;

  switch (preset) {
    case 'summer-glow':
      // Warmer Sommer-Look mit sanftem Film-Glow und Leuchtkraft
      rMult = 1.12;
      gMult = 1.05;
      bMult = 0.94;
      contrast = 1.08;
      brightness = 10;
      satBoost = 1.16;
      break;
    case 'golden-hour':
      // Intensives Abend-Goldlicht
      rMult = 1.22;
      gMult = 1.08;
      bMult = 0.86;
      contrast = 1.12;
      brightness = 8;
      satBoost = 1.25;
      break;
    case 'mediterranean-sun':
      // Türkis & Knalliges Sonnenlicht
      rMult = 1.06;
      gMult = 1.10;
      bMult = 1.14;
      contrast = 1.15;
      brightness = 14;
      satBoost = 1.22;
      break;
    case 'vintage-film':
      // Sanfter 35mm Analog-Look
      rMult = 1.08;
      gMult = 1.02;
      bMult = 0.92;
      contrast = 1.04;
      brightness = 4;
      satBoost = 0.98;
      break;
    case 'natural-clean':
      // Dezent optimiert
      rMult = 1.02;
      gMult = 1.01;
      bMult = 1.0;
      contrast = 1.05;
      brightness = 6;
      satBoost = 1.06;
      break;
  }

  // Pixel manipulation
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Saturation calculation
    const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
    r = gray + (r - gray) * satBoost;
    g = gray + (g - gray) * satBoost;
    b = gray + (b - gray) * satBoost;

    // Multipliers & Brightness
    r = r * rMult + brightness;
    g = g * gMult + brightness;
    b = b * bMult + brightness;

    // Contrast
    r = (r - 128) * contrast + 128;
    g = (g - 128) * contrast + 128;
    b = (b - 128) * contrast + 128;

    // Vintage film lift (crushed blacks to milky shadow)
    if (preset === 'vintage-film') {
      if (r < 30) r += (30 - r) * 0.4;
      if (g < 30) g += (30 - g) * 0.4;
      if (b < 35) b += (35 - b) * 0.5;
    }

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }
  ctx.putImageData(imgData, 0, 0);

  // Soft Film-Glow overlay (draw warm radial wash)
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  const warmWash = ctx.createRadialGradient(w / 2, h * 0.35, 10, w / 2, h / 2, Math.max(w, h));
  warmWash.addColorStop(0, 'rgba(251, 146, 60, 0.28)'); // Amber
  warmWash.addColorStop(0.6, 'rgba(244, 63, 94, 0.14)'); // Warm Rose
  warmWash.addColorStop(1, 'rgba(15, 23, 42, 0.35)'); // Shadow
  ctx.fillStyle = warmWash;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Subtle analog Vignette
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
  vignette.addColorStop(0, 'rgba(255, 255, 255, 1)');
  vignette.addColorStop(1, 'rgba(15, 23, 42, 0.7)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.88);
}

/**
 * Renders a full 1080x1920 (9:16) Instagram Story slide with stylized text-stickers,
 * location pill, and musical track badge.
 */
export async function renderStoryImage(
  photoUrl: string,
  slide: InstagramStorySlide,
  song: InstagramSong | null,
  dayTitle: string
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) return photoUrl;

  const img = await loadImage(photoUrl);

  // Center & crop image to 9:16 cover
  const targetAspect = 1080 / 1920;
  const imgAspect = img.width / img.height;
  let sx = 0,
    sy = 0,
    sw = img.width,
    sh = img.height;

  if (imgAspect > targetAspect) {
    // Image is wider than 9:16 -> crop left & right
    sw = img.height * targetAspect;
    sx = (img.width - sw) / 2;
  } else {
    // Image is taller than 9:16 -> crop top & bottom
    sh = img.width / targetAspect;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 1080, 1920);

  // Top Scrim for Status/Location (Cinematic shadow)
  const topGrad = ctx.createLinearGradient(0, 0, 0, 360);
  topGrad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
  topGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.35)');
  topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, 1080, 360);

  // Bottom Scrim for Caption & Music Badge
  const bottomGrad = ctx.createLinearGradient(0, 1400, 0, 1920);
  bottomGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  bottomGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.55)');
  bottomGrad.addColorStop(1, 'rgba(0, 0, 0, 0.92)');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, 1400, 1080, 520);

  // Top Location & Day Tag (Instagram Pill style)
  ctx.save();
  const locationText = `📍 ${slide.locationSticker || dayTitle || 'MALLORCA'}`.toUpperCase();
  ctx.font = 'bold 30px "Outfit", sans-serif';
  const locWidth = ctx.measureText(locationText).width + 60;
  const pillX = 60;
  const pillY = 120;
  const pillHeight = 58;

  // Glass pill background
  ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
  roundRect(ctx, pillX, pillY, locWidth, pillHeight, 29);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Location text
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(locationText, pillX + 30, pillY + pillHeight / 2);
  ctx.restore();

  // Slide Number indicator (e.g. "STORY 1/3")
  ctx.save();
  const slideNumText = `SLIDE ${slide.slideNumber} / 3`;
  ctx.font = 'bold 24px "Inter", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.textAlign = 'right';
  ctx.fillText(slideNumText, 1020, 155);
  ctx.restore();

  // Main Hook Headline Sticker (Hero visual in center-top)
  ctx.save();
  const headline = slide.hookHeadline || 'Golden Summer Moments';
  ctx.font = '800 68px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Backdrop for headline
  const headWidth = Math.min(940, ctx.measureText(headline).width + 80);
  const headX = (1080 - headWidth) / 2;
  const headY = 460;
  const headHeight = 110;

  ctx.fillStyle = 'rgba(2, 6, 23, 0.65)';
  roundRect(ctx, headX, headY, headWidth, headHeight, 28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(249, 115, 22, 0.6)'; // Sunset Amber border
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.fillText(headline, 540, headY + 22);
  ctx.restore();

  // Short Aesthetic Text-Sticker (e.g. quote / vibe note)
  if (slide.stickerText) {
    ctx.save();
    ctx.font = '500 38px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = `✨ ${slide.stickerText}`;
    const textWidth = Math.min(900, ctx.measureText(text).width + 60);
    const boxX = (1080 - textWidth) / 2;
    const boxY = 620;
    const boxH = 76;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    roundRect(ctx, boxX, boxY, textWidth, boxH, 20);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.fillText(text, 540, boxY + boxH / 2);
    ctx.restore();
  }

  // Instagram Music Sticker Badge (Bottom)
  if (song) {
    ctx.save();
    const musicX = 60;
    const musicY = 1680;
    const musicW = 960;
    const musicH = 140;

    // Music banner background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    roundRect(ctx, musicX, musicY, musicW, musicH, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Vinyl / Audio wave icon placeholder
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(musicX + 70, musicY + 70, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(musicX + 70, musicY + 70, 14, 0, Math.PI * 2);
    ctx.fill();

    // Song Title & Artist
    ctx.font = 'bold 36px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(`${song.title}`, musicX + 135, musicY + 54);

    ctx.font = '500 28px "Inter", sans-serif';
    ctx.fillStyle = '#fb923c';
    ctx.fillText(`${song.artist} · ${song.vibe || 'Summer Vibe'}`, musicX + 135, musicY + 98);

    // Audio timestamp indicator badge
    if (song.hookTimestamp) {
      ctx.font = 'bold 22px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.textAlign = 'right';
      ctx.fillText(`⏱️ ${song.hookTimestamp}`, musicX + musicW - 30, musicY + 75);
    }

    ctx.restore();
  }

  return canvas.toDataURL('image/jpeg', 0.92);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
