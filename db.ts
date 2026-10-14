import { LogEntry } from '../types';

const DB_NAME = 'VacationRecapDB';
const DB_VERSION = 2;
const STORE_NAME = 'logs';

let dbInstance: IDBDatabase | null = null;

export function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (e) => {
      dbInstance = (e.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
  });
}

export async function getAllEntries(): Promise<LogEntry[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const items = (req.result || []) as LogEntry[];
      items.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
      resolve(items);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveEntry(entry: LogEntry): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(entry);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Creates sample SVG Data URL for vacation demo placeholders
 */
export function createDemoPhoto(bg1: string, bg2: string, title: string, sub: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
    <defs>
      <linearGradient id="sky" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
      <radialGradient id="sun" cx="80%" cy="20%" r="50%">
        <stop offset="0%" stop-color="#fffbeb" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1080" height="1080" fill="url(#sky)"/>
    <circle cx="850" cy="220" r="180" fill="url(#sun)"/>
    <path d="M0 720 Q280 620 540 690 T1080 650 L1080 1080 L0 1080 Z" fill="#0f172a" opacity="0.6"/>
    <path d="M0 790 Q340 710 680 770 T1080 730 L1080 1080 L0 1080 Z" fill="#020617"/>
    <text x="70" y="930" font-family="'Outfit', sans-serif" font-size="52" font-weight="bold" fill="#ffffff">${title}</text>
    <text x="70" y="990" font-family="'Inter', sans-serif" font-size="32" fill="rgba(255,255,255,0.85)">${sub}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export async function seedDemoData(): Promise<LogEntry[]> {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);

  const demoEntries: LogEntry[] = [
    {
      id: 'demo_day_2',
      date: yesterday.toISOString().split('T')[0],
      title: 'Tag 2 – Königsetappe Serra de Tramuntana & Cap Formentor',
      mood: '🤩',
      moodLabel: 'Legendär',
      impressions:
        'Früh morgens bei 21 Grad losgefahren. Die Serpentinenstraße nach Formentor lag noch im sanften Morgennebel, bevor das Meer tiefblau aufblitzte. Jeder Anstieg tat gut in den Beinen.',
      food: 'Frische Gambas al Ajillo, warmer Mandelkuchen und eiskalter Cortado',
      foodRating: 5,
      moments:
        'Oben am Aussichtspunkt stehen, der Wind vom Mittelmeer im Gesicht und die Serpentinen weit unter einem sehen.',
      reflection:
        'Den eigenen Rhythmus finden schlägt blindes Draufhalten. Urlaub ist, wenn die Gedanken aufhören im Kreis zu rennen und man einfach nur da ist.',
      filterPreset: 'summer-glow',
      aiSummary:
        'Ein Tag voller purer Lebensfreude zwischen schroffen Felswänden und endlosem Meereshorizont. Die Tramuntana hat dich gefordert, aber mit dem schönsten mediterranen Licht belohnt.',
      photoInsights:
        'Die warmen Bergfelsen fangen das goldene Nachmittagslicht perfekt ein. Der Kontrast zwischen azurblauem Wasser und Pinienbäumen profitiert enorm vom Sommer-Glow.',
      quoteOfTheDay: 'Wer im eigenen Takt reist, erreicht jeden Gipfel mit einem Lächeln.',
      vibeKeywords: ['Serra de Tramuntana', 'Cap de Formentor', 'Goldene Serpentinen', 'Pinienduft', 'Mittelmeerbrise'],
      photos: [
        {
          id: 'p1',
          originalUrl: createDemoPhoto('#f97316', '#be123c', 'Cap de Formentor', 'Serpentinen & Klippen'),
          enhancedUrl: createDemoPhoto('#f97316', '#be123c', 'Cap de Formentor', 'Serpentinen & Klippen'),
          caption: 'Blick über die Klippen am Cap de Formentor',
          filterPreset: 'summer-glow',
        },
        {
          id: 'p2',
          originalUrl: createDemoPhoto('#0284c7', '#0f172a', 'Bodega am Hafen', 'Gambas al Ajillo & Vino'),
          enhancedUrl: createDemoPhoto('#0284c7', '#0f172a', 'Bodega am Hafen', 'Gambas al Ajillo & Vino'),
          caption: 'Abendessen mit frischem Fisch & Meeresblick',
          filterPreset: 'summer-glow',
        },
      ],
      instagramPackage: {
        vibe: 'Sonniger Balearen-Rhythmus mit euphorisierendem Freiheitsgefühl',
        recommendedSong: {
          title: 'Sun Models',
          artist: 'ODESZA feat. Madelyn Grant',
          vibe: 'Warmer Melodic Summer Anthem',
          hookTimestamp: 'Ab 0:45 (Drop mit Vocals)',
          searchLink: 'ODESZA Sun Models',
        },
        slides: [
          {
            slideNumber: 1,
            hookHeadline: 'Endless Horizons Ahead',
            stickerText: '09:15 AM · Riding the Tramuntana ridges',
            locationSticker: 'Cap de Formentor, Mallorca',
            photoIndex: 0,
          },
          {
            slideNumber: 2,
            hookHeadline: 'Taste of the Mediterranean',
            stickerText: 'Gambas al Ajillo & Sunset Wine',
            locationSticker: 'Port de Pollença Bodega',
            photoIndex: 1,
          },
          {
            slideNumber: 3,
            hookHeadline: 'Mind completely offline',
            stickerText: '„Urlaub ist, wenn die Gedanken Pause machen.“',
            locationSticker: 'Serra de Tramuntana',
            photoIndex: 0,
          },
        ],
        fullCaption:
          'Kurven, Meeresbrise und Salz auf der Haut. Tag 2 auf Mallorca war genau die Dosis Freiheit, die gefehlt hat. Morgens Formentor hoch, nachmittags frische Gambas am Hafen und abends einfach nur das Meer beobachten. 🌊✨\n\nWelcher Spot darf auf Mallorca nie fehlen? 👇',
        hashtags: ['#Mallorca2026', '#Tramuntana', '#CapDeFormentor', '#IslandLife', '#SummerVibes', '#TravelLog'],
      },
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'demo_day_1',
      date: twoDaysAgo.toISOString().split('T')[0],
      title: 'Tag 1 – Ankommen, Meeresluft & Tapas',
      mood: '😎',
      moodLabel: 'Entspannt',
      impressions:
        'Gelandet, Koffer abgestellt und direkt barfuß in den Sand. Die warme Brise und der Geruch nach Pinien haben den ganzen Alltagsstress in zehn Minuten verfliegen lassen.',
      food: 'Pimientos de Padrón, Pan con Tomate und frischer Pulpo',
      foodRating: 5,
      moments: 'Der erste Schluck kalter Weißwein bei Sonnenuntergang auf der Mole.',
      reflection: 'Man braucht gar nicht viel, um glücklich zu sein: Sonne, gutes Essen und Zeit.',
      filterPreset: 'summer-glow',
      aiSummary: 'Ein sanfter und warmer Auftakt in den Urlaub. Ankommen, durchatmen und die Zeit dehnen.',
      photoInsights: 'Weiches Dämmerlicht am Strand, perfekt für ruhige Farbtöne.',
      quoteOfTheDay: 'Das Meer spült die Eile aus dem Kopf.',
      vibeKeywords: ['Ankunft', 'Salzluft', 'Erste Tapas', 'Sonnenuntergang'],
      photos: [
        {
          id: 'p3',
          originalUrl: createDemoPhoto('#7c3aed', '#f97316', 'Erster Strandabend', 'Sonnenuntergang am Meer'),
          enhancedUrl: createDemoPhoto('#7c3aed', '#f97316', 'Erster Strandabend', 'Sonnenuntergang am Meer'),
          caption: 'Erster Sonnenuntergang nach der Landung',
          filterPreset: 'summer-glow',
        },
      ],
      createdAt: Date.now() - 172800000,
    },
  ];

  for (const entry of demoEntries) {
    await saveEntry(entry);
  }
  return demoEntries;
}
