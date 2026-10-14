# VacationLog AI — Android-Ready Reise-Tagebuch mit KI-Story-Creator

Ein intelligentes, mobiles Urlaubs-Tagebuch mit automatischer Gemini-Bildanalyse, kreativen Abend-Zusammenfassungen, automatischem warmen Sommer-Film-Glow, täglichen Reflexions-Push-Benachrichtigungen und einem vollwertigen Instagram-Story-Generator inklusive Text-Sticker und Song-Vorschlägen.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Basierend auf deiner Rückmeldung im interaktiven Interview wurden folgende drei Kern-Entscheidungen festgelegt:

- **Confirmed Decision 1 (Android & APK Integration)**: Volle Vorbereitung für **Capacitor & native Android APK** sowie direkte installierbare PWA (Web App Manifest, Service Worker, Offline-Support und schlüsselfertiges Capacitor-Projekt-Setup samt Schritt-für-Schritt APK-Bauanleitung).
- **Confirmed Decision 2 (Bildbearbeitungs-Stil)**: Automatischer **warmer Sommer-Look mit sanftem Film-Glow und Leuchtkraft** (Canvas-gestützte Farbgradierung mit warmen Goldtönen, leichter Sättigungsanhebung, diffusem Highlight-Glow und optional feiner Filmkörnung).
- **Confirmed Decision 3 (Social-Media-Format)**: Generierung von **Instagram Story-Sequenzen (9:16)** mit passenden Text-Stickern (z.B. Location, Uhrzeit, Zitat, Gedanken), Copy-Funktionen und konkreten **Song-/Sound-Empfehlungen** (Titel, Interpret, Vibe und passender Reel/Story-Hook).

---

## 1. Overview & Core Concept

VacationLog AI verwandelt das bisherige statische Urlaubstagebuch in einen modernen Reisebegleiter:
1. **Fotoupload & KI-Vision-Auswertung**: Nutzer laden 1–3 Urlaubsfotos hoch. Gemini analysiert die Bilder semantisch (Szene, Lichtstimmung, Farben, Aktivitäten, Food).
2. **Automatische Sommer-Glow-Bearbeitung**: Fotos erhalten automatisch den gewählten warmen Film-Glow (oder anpassbare Presets wie *Golden Hour*, *Mediterranean Sun*, *Vintage 35mm*), der direkt im Browser auf einem HTML5-Canvas gerendert und exportiert werden kann.
3. **Kreatives Tages-Recap**: Am Ende des Tages fasst Gemini Eindrücke, Essen und Reflexionen in einem lebendigen, atmosphärischen Reisetext zusammen.
4. **Instagram Story Studio**: Ein interaktiver 9:16 Canvas-Editor erzeugt teilbare Story-Slides mit eingebrannten Text-Stickern, Hashtags und handverlesenen Song-Empfehlungen für Instagram Audio.
5. **Push-Erinnerungen für die Abend-Routine**: Über die Web Notifications API und lokale Timer erinnert die App abends (z.B. 20:00 Uhr) an den täglichen Check-in.
6. **Android & Offline First**: Datenspeicherung in IndexedDB für volle Offline-Fähigkeit am Strand oder im Flugzeug, kombiniert mit nativer Capacitor-Konfiguration zum direkten Kompilieren einer Android `.apk`.

---

## 2. User Experience & Visual Design

### Aesthetic Direction & Visual Identity
- **Atmosphäre**: „Endloser Mittelmeer-Sommer“ — warm, modern, taktil und mobil-optimiert.
- **Farben & Kontrast (60-30-10 Regel)**:
  - `60% Neutral Canvas`: Tiefes Nachtblau (`#020617` / `#0b1120`), das Urlaubsfotos strahlen lässt.
  - `30% Structural Surfaces`: Glassmorphism-Karten (`rgba(30, 41, 59, 0.72)`) mit feinen Linien und warmen Slate-Tönen.
  - `10% Accent Highlight`: Warmer Sonnenuntergangs-Farbverlauf (`#f97316` Amber über `#e11d48` Rose zu `#7c3aed` Violett).
- **Typografie**:
  - Display / Headlines: `Outfit` (charakterstark, geometrisch, warm).
  - Fließtext / Controls: `Inter` (hohe Lesbarkeit auf Smartphones).
  - Zeit- & Metadaten: Tabellarische Zahlen (`font-mono tabular-nums`).
- **Touch-Ergonomie**:
  - Alle Interaktionselemente $\ge 44 \times 44\text{px}$.
  - Feste Bottom-Navigation (Daumenzone) mit 4 Reitern: **Tages-Log**, **Check-in (+)**, **Story Studio**, **Recap**.
  - PWA-Install-Banner und Offline-Statusindikator im Header.

### Key User Flows
1. **Abend-Check-in mit Bild-Upload**: Nutzer wählt Datum, Stimmung, Notizen und bis zu 3 Bilder.
2. **KI-Assistent aktivieren**: Ein Klick auf „✨ KI-Magie anwenden“ startet:
   - Bildanalyse & Schlagwort-Erkennung.
   - Automatische Bildoptimierung im Sommer-Glow-Stil.
   - Generierung einer kreativen, poetischen Tages-Zusammenfassung.
   - Instagram-Story-Sequenz mit 3 Slides & passendem Song.
3. **Instagram Story Studio**: Nutzer wählt Slide, passt Text-Sticker oder Filterfeinheiten an und lädt das fertige 9:16 Bild herunter oder kopiert die Caption in die Zwischenablage.
4. **Push-Benachrichtigung**: Nutzer aktiviert im Einstellungs-Menü die tägliche Reflexions-Erinnerung (Test-Push sofort oder geplanter Alarm um 20:00 Uhr).
5. **APK Export & Capacitor Guide**: Ein interaktives Modal liefert die fertige `capacitor.config.ts`, den Manifest-Download und die 3 Befehle zur Erstellung der Android APK via Android Studio.

---

## 3. Key Product Decisions & Trade-Offs

| Entscheidung | Gewählte Lösung | Begründung & Vorteil |
| :--- | :--- | :--- |
| **KI-Modell & Multimodalität** | `gemini-3.8-flash` via Server-Proxy (`/api/ai/*`) | Rasante Latenz (<2s), exzellente Bildanalyse, sichere API-Key-Verwaltung auf dem Express-Server ohne Client-Exposure. |
| **Bildbearbeitung** | Client-Side Canvas 2D Shader-Filter | Keine hohen Upload-Kosten für Bildrenderings; Echtzeit-Vorschau von Wärme, Kontrast, Vignette und Film-Glow direkt auf dem Gerät. |
| **Instagram Story Export** | HTML5 Canvas-to-Blob (9:16 1080x1920) | Ermöglicht den direkten Download von hochauflösenden Story-Bildern mit festen Stickern, die direkt in Instagram importiert werden können. |
| **Offline-Speicherung** | IndexedDB via `idb-keyval` / nativer IndexedDB | Unterstützt mehrere hochauflösende Fotos ohne Speicherbeschränkung des LocalStorage (5MB-Limit umgangen). |
| **Android APK Strategie** | PWA + Capacitor Blueprint | Nutzer kann die App sofort ohne App Store als PWA installieren ODER mit den bereitgestellten Configs in 5 Minuten als APK über Capacitor bauen. |

---

## 4. Technical Architecture & Data Strategy

### System- & Komponenten-Diagramm

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VITE REACT CLIENT (PWA)                         │
│                                                                        │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐  │
│  │     Top Header        │  │       PWA / Push Service Worker        │  │
│  │ [Offline / APK Modal] │  │  • Web Notification Scheduler           │  │
│  └──────────┬────────────┘  └───────────────────┬────────────────────┘  │
│             │                                   │                       │
│  ┌──────────▼───────────────────────────────────▼────────────────────┐  │
│  │                      View Switcher / Router                       │  │
│  │                                                                   │  │
│  │  ┌───────────────┐ ┌────────────────┐ ┌─────────────────────────┐ │  │
│  │  │  1. Timeline  │ │ 2. Check-In    │ │ 3. Instagram Story      │ │  │
│  │  │  & Gestern-Log│ │    Formular    │ │    Studio (9:16 Canvas) │ │  │
│  │  └───────┬───────┘ └───────┬────────┘ └───────────┬─────────────┘ │  │
│  │          │                 │                      │               │  │
│  │  ┌───────▼─────────────────▼──────────────────────▼─────────────┐ │  │
│  │  │              Canvas Image Glow & Filter Engine               │ │  │
│  │  │  • Warm Summer Glow Preset   • Instagram 9:16 Exporter       │ │  │
│  │  └─────────────────────────┬────────────────────────────────────┘ │  │
│  └────────────────────────────┼──────────────────────────────────────┘  │
│                               │                                         │
│  ┌────────────────────────────▼──────────────────────────────────────┐  │
│  │             IndexedDB Storage Layer (VacationRecapDB)             │  │
│  │  • Tagebuch-Einträge  • Komprimierte Fotos  • AI Stories & Songs  │  │
│  └────────────────────────────┬──────────────────────────────────────┘  │
└───────────────────────────────┼─────────────────────────────────────────┘
                                │ HTTP POST (JSON / Base64)
┌───────────────────────────────▼─────────────────────────────────────────┐
│                    EXPRESS BACKEND SERVER (Node.js)                     │
│                                                                         │
│  ┌────────────────────────────┬──────────────────────────────────────┐  │
│  │ POST /api/ai/analyze-day   │ POST /api/ai/instagram-story         │  │
│  │ • Multimodal Gemini Vision │ • 3-Slide Story Sequenzen            │  │
│  │ • Kreative Tages-Reflexion │ • Sticker-Texte & Song-Empfehlungen  │  │
│  └────────────────────────────┴──────────────────────────────────────┘  │
│                               │                                         │
│                               ▼                                         │
│                 @google/genai (gemini-3.8-flash)                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Datenmodell (IndexedDB Log-Entry)
```ts
interface PhotoItem {
  id: string;
  dataUrl: string;             // Original / komprimiert
  enhancedDataUrl?: string;     // Mit Sommer-Glow-Filter bearbeitet
  caption?: string;
  aiAnalysis?: string;         // Von Gemini erkannte Szene
}

interface InstagramStorySlide {
  slideNumber: number;
  photoIndex: number;
  hookHeadline: string;
  stickerText: string;
  locationSticker: string;
  captionExcerpt: string;
}

interface InstagramPackage {
  vibe: string;
  recommendedSong: {
    title: string;
    artist: string;
    hookMoment: string;
    spotifySearchQuery: string;
  };
  slides: InstagramStorySlide[];
  fullCaption: string;
  hashtags: string[];
}

interface LogEntry {
  id: string;
  date: string;
  title: string;
  mood: string;
  moodLabel: string;
  impressions: string;
  food: string;
  foodRating: number;
  moments: string;
  reflection: string;
  photos: PhotoItem[];
  aiSummary?: string;          // Kreativer Tages-Recap von Gemini
  instagramPackage?: InstagramPackage;
  filterPreset: 'summer-glow' | 'golden-hour' | 'vintage-film' | 'natural';
  createdAt: number;
}
```

### Backend-Endpunkte
1. `POST /api/ai/analyze-day`:
   - Sendet Notizen und die komprimierten Fotos an `gemini-3.8-flash`.
   - Liefert eine poetische Zusammenfassung, Bildbeschreibungen und automatische Farb-/Stimmungskorrektur-Tipps zurück.
2. `POST /api/ai/instagram-story`:
   - Generiert anhand der Fotos und Reflexionen eine 3-teilige Instagram Story-Sequenz mit kurzen Stickern, Caption, Hashtags und passendem Song-Vorschlag.
3. `POST /api/push/test`:
   - Löst bei Bedarf eine Test-Benachrichtigung für den Client aus.

---

## 5. Implementierungs-Phasen & Schritte

1. **Backend & Gemini API Proxy (`server.ts`)**:
   - Express Server mit Routen `/api/ai/analyze-day` und `/api/ai/instagram-story`.
   - Einbindung des `@google/genai` SDKs mit Telemetrie-Header und Modell `gemini-3.8-flash`.
   - Startskript in `package.json` und Vite-Proxy für lokale Entwicklung.
2. **Canvas Image Glow & Filter Engine (`src/utils/imageFilters.ts`)**:
   - Schnelle Canvas-basierte Filterfunktionen für den gewünschten **warmen Sommer-Look mit Film-Glow** (Warme Farbbalance, weiche Highlights, leichter Kontrast, Sättigung).
   - High-Res 9:16 Instagram Story Canvas-Renderer mit Text-Stickern.
3. **PWA, Push-Benachrichtigungen & Capacitor Kit**:
   - `vite-plugin-pwa` Konfiguration mit Web App Manifest und Service Worker.
   - Lokaler Push-Manager für tägliche Reflexionen (Web Notification API).
   - `capacitor.config.ts` und Export-Modal mit schlüsselfertigen Anweisungen für Android Studio / APK-Builds.
4. **UI-Komponenten & Flow**:
   - **Tages-Log / Dashboard**: Vorschau auf den letzten Tag, Timeline aller Tage, Quick-Stats.
   - **Check-in Formular**: Eingabe von Eindrücken, Essen, Fotos und dem neuen Button „✨ KI-Analyse & Auto-Glow“.
   - **Instagram Story Studio**: 9:16 Live-Vorschau der generierten Story-Slides mit Sticker-Overlay, Song-Player-Badge (mit Direktlink zu Spotify/Audio), Sofort-Download des bearbeiteten Story-Bildes und Copy-Buttons.
   - **Gesamt-Recap & Print**: Urlaubsübersicht mit allen Highlights, Speisen und Fotogalerie.
5. **Verifikation & Build**:
   - Überprüfung mit `compile_applet` und `lint_applet`.
   - Testen aller Flows und Offline-Resilienz.
