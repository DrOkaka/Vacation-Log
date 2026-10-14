import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Route: AI-based Day Analysis & Creative Summary
app.post('/api/ai/analyze-day', async (req, res) => {
  try {
    const { title, date, impressions, food, moments, reflection, mood, moodLabel, photos } = req.body;

    const parts: any[] = [];

    // Attach images if provided
    if (Array.isArray(photos) && photos.length > 0) {
      for (const p of photos.slice(0, 3)) {
        if (p.dataUrl) {
          const match = p.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            });
          }
        }
      }
    }

    const promptText = `Du bist ein brillanter, empathischer Reiseschriftsteller und kreativer Storyteller.
Hier sind die Notizen eines Urlaubstages:
- Titel / Ort: ${title || 'Urlaubstag'}
- Datum: ${date || ''}
- Stimmung: ${mood || '🤩'} (${moodLabel || 'Gut'})
- Eindrücke: ${impressions || 'Keine Angabe'}
- Kulinarik / Essen: ${food || 'Keine Angabe'}
- Schönste Momente: ${moments || 'Keine Angabe'}
- Gedanken / Reflexion: ${reflection || 'Keine Angabe'}

Aufgabe:
Analysiere die Notizen und ggf. die beigefügten Bilder. Erstelle:
1. "creativeSummary": Eine atmosphärische, poetische und lebendige Zusammenfassung des Tages (ca. 2 kurze Absätze). Schreib fesselnd, sinnlich (Licht, Gerüche, Wärme, Entspannung).
2. "photoInsights": Wenn Bilder vorliegen, gib eine kurze Beobachtung zu Licht, Farben und Bildkomposition (z.B. warum sie perfekt für warmen Sommer-Glow geeignet sind).
3. "quoteOfTheDay": Ein inspirierendes, kurzes Zitat oder Mantra, das zu den heutigen Gedanken passt.
4. "vibeKeywords": 4-5 atmosphärische Schlagworte (z.B. "Cap de Formentor", "Salz auf der Haut", "Goldenes Abendlicht").

Antworte ausschließlich im JSON-Format gemäß folgendem Schema:
{
  "creativeSummary": "...",
  "photoInsights": "...",
  "quoteOfTheDay": "...",
  "vibeKeywords": ["...", "..."]
}`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            creativeSummary: { type: Type.STRING },
            photoInsights: { type: Type.STRING },
            quoteOfTheDay: { type: Type.STRING },
            vibeKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['creativeSummary', 'photoInsights', 'quoteOfTheDay', 'vibeKeywords'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.warn('Gemini analyze-day fallback triggered:', error?.message);
    const titleVal = req.body.title || 'Urlaubstag am Meer';
    const foodVal = req.body.food || 'Mediterrane Spezialitäten';
    const momentsVal = req.body.moments || 'Sonnenuntergang am Horizont';
    res.json({
      success: true,
      creativeSummary: `Ein herrlicher Tag in ${titleVal}. Zwischen warmem Sommerlicht, dem Duft von ${foodVal} und den unvergesslichen Augenblicken wie „${momentsVal}“ hat dieser Reisetag genau die Leichtigkeit gebracht, die Urlaub ausmacht.`,
      photoInsights: 'Die warmen Farbtöne und das mediterrane Streulicht harmonieren wunderbar mit dem Sommer-Glow.',
      quoteOfTheDay: 'Das Meer und die Sonne nehmen dem Alltag das Gewicht.',
      vibeKeywords: [titleVal, 'Goldener Sommer', 'Meeresbrise', 'Freiheitsgefühl'],
    });
  }
});

// Route: AI-based Instagram Story Sequenzen & Song Empfehlung
app.post('/api/ai/instagram-story', async (req, res) => {
  try {
    const { title, date, impressions, food, moments, reflection, mood, photos } = req.body;

    const parts: any[] = [];

    if (Array.isArray(photos) && photos.length > 0) {
      for (const p of photos.slice(0, 3)) {
        if (p.dataUrl) {
          const match = p.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            });
          }
        }
      }
    }

    const promptText = `Du bist ein Social-Media-Art-Director und erfahrener Instagram-Creator für Travel & Lifestyle.
Erstelle für diesen Reisetag ein maßgeschneidertes Instagram Story-Paket mit 3 Slides (im 9:16 Format) und einer perfekten Song-/Audio-Empfehlung.

Reisedaten:
- Ort / Titel: ${title}
- Datum: ${date}
- Stimmung: ${mood}
- Eindrücke: ${impressions}
- Bestes Essen: ${food}
- Highlight-Momente: ${moments}
- Gedanken: ${reflection}

Anforderungen:
1. "recommendedSong": Wähle einen echten, bekannten oder passenden Indie/Pop/Chillout/Electronic Song mit sonnigem Sommer-Vibe (z.B. von Leon Bridges, BUNT., Fred again.., Zimmer, Polo & Pan, Khruangbin, Dom Dolla, Rüfüs Du Sol, Milky Chance etc.).
   - title: Songtitel
   - artist: Künstler
   - vibe: Beschreibung des Gefühls (z.B. "Warmer Golden-Hour Deep House", "Akustischer Sommer-Chill")
   - hookTimestamp: Der beste Drop / Moment im Song für Instagram Stories (z.B. "Ab Sekunde 0:34 (Refrain Drop)")
   - searchLink: Ein Spotify-/Instagram-Suchbegriff (z.B. "BUNT. Clouds")
2. "slides": Genau 3 Story-Slides:
   - Slide 1 (Hook / Day Starter):
     - hookHeadline: Kurzer, knackiger Opener (max. 4-5 Wörter)
     - stickerText: Stylischer Sticker-Text (z.B. "08:30 AM · First Coffee by the Sea")
     - locationSticker: Passender Orts-Tag (z.B. "Mallorca, Illes Balears")
     - photoIndex: Empfohlener Foto-Index (0, 1 oder 2)
   - Slide 2 (The Taste / Highlight):
     - hookHeadline: Fokus auf Essen oder das Highlight
     - stickerText: Witziger oder sinnlicher kurzer Sticker
     - locationSticker: Konkreter Spot
     - photoIndex: Empfohlener Foto-Index (0, 1 oder 2)
   - Slide 3 (Golden Hour / Reflection):
     - hookHeadline: Emotionaler, ruhiger Abschluss
     - stickerText: Schöner Gedanke oder Zitat
     - locationSticker: Sonnenuntergangs-Spot
     - photoIndex: Empfohlener Foto-Index (0, 1 oder 2)
3. "fullCaption": Ein kompletter, ansprechender Instagram-Post-Text (Feed oder Reel/Carousel) mit Absätzen, Emojis und Storytelling.
4. "hashtags": 6-8 trendige, ästhetische Reise-Hashtags.

Antworte ausschließlich in folgendem JSON-Schema:
{
  "vibe": "...",
  "recommendedSong": {
    "title": "...",
    "artist": "...",
    "vibe": "...",
    "hookTimestamp": "...",
    "searchLink": "..."
  },
  "slides": [
    {
      "slideNumber": 1,
      "hookHeadline": "...",
      "stickerText": "...",
      "locationSticker": "...",
      "photoIndex": 0
    },
    {
      "slideNumber": 2,
      "hookHeadline": "...",
      "stickerText": "...",
      "locationSticker": "...",
      "photoIndex": 1
    },
    {
      "slideNumber": 3,
      "hookHeadline": "...",
      "stickerText": "...",
      "locationSticker": "...",
      "photoIndex": 2
    }
  ],
  "fullCaption": "...",
  "hashtags": ["...", "..."]
}`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vibe: { type: Type.STRING },
            recommendedSong: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                vibe: { type: Type.STRING },
                hookTimestamp: { type: Type.STRING },
                searchLink: { type: Type.STRING },
              },
              required: ['title', 'artist', 'vibe', 'hookTimestamp', 'searchLink'],
            },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slideNumber: { type: Type.INTEGER },
                  hookHeadline: { type: Type.STRING },
                  stickerText: { type: Type.STRING },
                  locationSticker: { type: Type.STRING },
                  photoIndex: { type: Type.INTEGER },
                },
                required: ['slideNumber', 'hookHeadline', 'stickerText', 'locationSticker', 'photoIndex'],
              },
            },
            fullCaption: { type: Type.STRING },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['vibe', 'recommendedSong', 'slides', 'fullCaption', 'hashtags'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.warn('Gemini instagram-story fallback triggered:', error?.message);
    const titleVal = req.body.title || 'Urlaubstag';
    const foodVal = req.body.food || 'Lokale Köstlichkeiten';
    const momentsVal = req.body.moments || 'Momente für die Ewigkeit';
    res.json({
      success: true,
      vibe: 'Warmer Mittelmeer-Rhythmus mit sonnigem Freiheitsgefühl',
      recommendedSong: {
        title: 'Sun Models',
        artist: 'ODESZA',
        vibe: 'Warmer Melodic Summer Anthem',
        hookTimestamp: 'Ab 0:42 Drop',
        searchLink: 'ODESZA Sun Models',
      },
      slides: [
        {
          slideNumber: 1,
          hookHeadline: `Golden Hours in ${titleVal}`,
          stickerText: '09:30 AM · First sunlight & coastal breeze',
          locationSticker: titleVal,
          photoIndex: 0,
        },
        {
          slideNumber: 2,
          hookHeadline: 'Taste of Paradise',
          stickerText: foodVal,
          locationSticker: `${titleVal} Bodega`,
          photoIndex: 1,
        },
        {
          slideNumber: 3,
          hookHeadline: 'Mind completely offline',
          stickerText: `„${momentsVal}“`,
          locationSticker: `${titleVal} Sunset`,
          photoIndex: 2,
        },
      ],
      fullCaption: `Sonne auf der Haut, Salz in den Haaren und der Kopf endlich frei. ${titleVal} hat heute wieder bewiesen, wie gut es tut, einfach den Moment zu leben. 🌊✨\n\n🍽️ Highlight: ${foodVal}\n✨ Moment: ${momentsVal}`,
      hashtags: ['#TravelDiaries', '#SummerGlow', '#GoldenHour', '#Wanderlust', '#IslandVibes'],
    });
  }
});

// Serve frontend
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`VacationLog AI server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
