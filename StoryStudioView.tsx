import React, { useState, useEffect } from 'react';
import {
  Instagram,
  Download,
  Share2,
  Copy,
  Check,
  Music,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Layers,
  Wand2,
  Loader2,
  MapPin,
} from 'lucide-react';
import { LogEntry, InstagramStorySlide, InstagramSong, FilterPreset } from '../types';
import { renderStoryImage, applyFilterToImage } from '../utils/imageFilters';

interface StoryStudioViewProps {
  entries: LogEntry[];
  selectedEntryId?: string;
  onUpdateEntry: (entry: LogEntry) => void;
  onBackToDashboard: () => void;
}

export const StoryStudioView: React.FC<StoryStudioViewProps> = ({
  entries,
  selectedEntryId,
  onUpdateEntry,
  onBackToDashboard,
}) => {
  const [activeEntryId, setActiveEntryId] = useState<string>(
    selectedEntryId || (entries[0] ? entries[0].id : '')
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isGeneratingStories, setIsGeneratingStories] = useState(false);
  const [renderedStoryPreview, setRenderedStoryPreview] = useState<string>('');
  const [isRenderingStory, setIsRenderingStory] = useState(false);

  const activeEntry = entries.find((e) => e.id === activeEntryId) || entries[0];

  useEffect(() => {
    if (selectedEntryId) {
      setActiveEntryId(selectedEntryId);
    }
  }, [selectedEntryId]);

  // When active slide or active entry changes, re-render the high-res 9:16 story preview
  useEffect(() => {
    async function updatePreview() {
      if (!activeEntry) return;

      const currentPkg = activeEntry.instagramPackage;
      const slides = currentPkg?.slides || [];
      const currentSlide: InstagramStorySlide = slides[activeSlideIndex] || {
        slideNumber: activeSlideIndex + 1,
        hookHeadline: activeEntry.title || 'Golden Vacation Days',
        stickerText: activeEntry.moments || 'Unforgettable moments',
        locationSticker: 'Mallorca',
        photoIndex: 0,
      };

      // Pick photo
      let photoUrl = '';
      if (activeEntry.photos && activeEntry.photos.length > 0) {
        const photo =
          activeEntry.photos[currentSlide.photoIndex] ||
          activeEntry.photos[0];
        photoUrl = photo.enhancedUrl || photo.originalUrl;
      }

      if (!photoUrl) {
        // Fallback placeholder image
        photoUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><rect width="1080" height="1920" fill="#0f172a"/><text x="540" y="960" font-family="sans-serif" font-size="48" fill="#ffffff" text-anchor="middle">Kein Foto vorhanden</text></svg>`
        );
      }

      setIsRenderingStory(true);
      try {
        const result = await renderStoryImage(
          photoUrl,
          currentSlide,
          currentPkg?.recommendedSong || null,
          activeEntry.title
        );
        setRenderedStoryPreview(result);
      } catch (err) {
        console.error('Error rendering story preview:', err);
      } finally {
        setIsRenderingStory(false);
      }
    }

    updatePreview();
  }, [activeEntry, activeSlideIndex]);

  // Generate Instagram Story package on-demand if missing
  const handleGenerateStoryPackage = async () => {
    if (!activeEntry) return;
    setIsGeneratingStories(true);

    try {
      const res = await fetch('/api/ai/instagram-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeEntry.title,
          date: activeEntry.date,
          impressions: activeEntry.impressions,
          food: activeEntry.food,
          moments: activeEntry.moments,
          reflection: activeEntry.reflection,
          mood: activeEntry.mood,
          photos: (activeEntry.photos || []).map((p) => ({ dataUrl: p.originalUrl })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        const updatedEntry: LogEntry = {
          ...activeEntry,
          instagramPackage: {
            vibe: data.vibe,
            recommendedSong: data.recommendedSong,
            slides: data.slides,
            fullCaption: data.fullCaption,
            hashtags: data.hashtags,
          },
        };
        onUpdateEntry(updatedEntry);
      } else {
        alert(data.error || 'Fehler beim Erstellen der Storys');
      }
    } catch (err) {
      console.error(err);
      alert('Verbindungsfehler beim Erstellen der Stories');
    } finally {
      setIsGeneratingStories(false);
    }
  };

  const handleDownloadStoryImage = () => {
    if (!renderedStoryPreview) return;
    const link = document.createElement('a');
    link.download = `instagram_story_${activeEntry?.date || 'day'}_slide${activeSlideIndex + 1}.jpg`;
    link.href = renderedStoryPreview;
    link.click();
  };

  const handleShareStory = async () => {
    if (!renderedStoryPreview) return;

    try {
      // Convert dataUrl to File for Web Share API
      const res = await fetch(renderedStoryPreview);
      const blob = await res.blob();
      const file = new File([blob], `story_slide_${activeSlideIndex + 1}.jpg`, { type: 'image/jpeg' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: activeEntry.title,
          text: activeEntry.instagramPackage?.fullCaption || activeEntry.impressions,
          files: [file],
        });
      } else {
        handleDownloadStoryImage();
      }
    } catch (err) {
      console.warn('Share canceled or not supported:', err);
      handleDownloadStoryImage();
    }
  };

  const handleCopyCaption = () => {
    if (!activeEntry?.instagramPackage) return;
    const pkg = activeEntry.instagramPackage;
    const textToCopy = `${pkg.fullCaption}\n\n🎵 Sound: ${pkg.recommendedSong?.title} – ${pkg.recommendedSong?.artist}\n\n${pkg.hashtags.join(' ')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-slate-400">Trage zuerst einen Reisetag ein, um Instagram Stories zu erstellen.</p>
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 rounded-xl bg-orange-500 text-white font-medium text-xs"
        >
          Zurück zum Tages-Log
        </button>
      </div>
    );
  }

  const pkg = activeEntry?.instagramPackage;
  const slides = pkg?.slides || [];

  return (
    <div className="space-y-6 pb-28">
      {/* Header & Day Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-400 flex items-center gap-1">
            <Instagram className="w-3.5 h-3.5" /> Instagram Story Studio
          </span>
          <h2 className="font-display text-xl font-bold text-white mt-0.5">
            Story-Sequenzen &amp; Sound-Vorschlag
          </h2>
        </div>

        {/* Day Selector */}
        {entries.length > 1 && (
          <select
            value={activeEntryId}
            onChange={(e) => {
              setActiveEntryId(e.target.value);
              setActiveSlideIndex(0);
            }}
            className="rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
          >
            {entries.map((e) => (
              <option key={e.id} value={e.id}>
                {e.date}: {e.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {!pkg ? (
        /* Prompt to Generate Stories */
        <div className="bg-slate-900/80 rounded-3xl p-6 border border-orange-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-rose-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-orange-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">
              Noch keine Story-Sequenz für diesen Tag
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
              Gemini analysiert die geloggten Bilder und Reflexionen, um 3 teilbare 9:16 Instagram Stories mit Text-Stickern, Caption und dem passenden Song zu generieren.
            </p>
          </div>
          <button
            onClick={handleGenerateStoryPackage}
            disabled={isGeneratingStories}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 text-white font-semibold text-xs flex items-center justify-center gap-2 mx-auto shadow-xl shadow-orange-500/25 hover:opacity-95 transition active:scale-95 disabled:opacity-50"
          >
            {isGeneratingStories ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gemini zaubert Story-Slides &amp; Song...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-amber-300" />
                <span>✨ 3-Slide Story Sequenz jetzt generieren</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Interactive 9:16 Story Creator Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 9:16 Interactive Canvas Preview */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* Slide Selector Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-900/90 rounded-2xl border border-white/10 mb-3 w-full max-w-[340px] justify-between">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition ${
                    activeSlideIndex === idx
                      ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Slide {idx + 1}
                </button>
              ))}
            </div>

            {/* 9:16 Phone Mockup Container */}
            <div className="relative w-full max-w-[340px] aspect-[9/16] rounded-[36px] overflow-hidden bg-slate-900 border-4 border-slate-800 shadow-2xl shadow-orange-500/10 flex items-center justify-center">
              {isRenderingStory ? (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
                  <span className="text-xs">Rendere 9:16 Story...</span>
                </div>
              ) : (
                <img
                  src={renderedStoryPreview}
                  alt={`Slide ${activeSlideIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Navigation arrows for slides */}
              <button
                onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeSlideIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 disabled:opacity-0 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveSlideIndex((prev) => Math.min(2, prev + 1))}
                disabled={activeSlideIndex === 2}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 disabled:opacity-0 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Export Bar */}
            <div className="flex items-center gap-2.5 mt-3 w-full max-w-[340px]">
              <button
                onClick={handleDownloadStoryImage}
                className="flex-1 py-3 px-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/25 active:scale-95 transition"
              >
                <Download className="w-4 h-4" />
                <span>Bild herunterladen</span>
              </button>
              <button
                onClick={handleShareStory}
                className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
                title="Teilen via Handy / Instagram"
              >
                <Share2 className="w-4 h-4 text-orange-400" />
                <span className="hidden xs:inline">Teilen</span>
              </button>
            </div>
          </div>

          {/* Right Column: Song Recommendation, Slide Details & Full Caption */}
          <div className="lg:col-span-6 space-y-4">
            {/* Song Recommendation Card */}
            {pkg.recommendedSong && (
              <div className="bg-gradient-to-br from-rose-500/15 via-slate-900/90 to-purple-500/10 rounded-3xl p-5 border border-rose-500/30 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                        Sound / Audio Empfehlung
                      </span>
                      <h4 className="font-display font-bold text-base text-white">
                        {pkg.recommendedSong.title}
                      </h4>
                      <p className="text-xs text-slate-300">{pkg.recommendedSong.artist}</p>
                    </div>
                  </div>

                  <a
                    href={`https://open.spotify.com/search/${encodeURIComponent(
                      pkg.recommendedSong.searchLink || `${pkg.recommendedSong.title} ${pkg.recommendedSong.artist}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-white/10 flex items-center gap-1 text-[11px]"
                    title="Auf Spotify anhören"
                  >
                    <span>Spotify</span>
                    <ExternalLink className="w-3 h-3 text-emerald-400" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase">Vibe</span>
                    <p className="text-slate-200 font-medium mt-0.5">{pkg.recommendedSong.vibe}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase">Story Drop-Moment</span>
                    <p className="text-orange-400 font-medium mt-0.5">{pkg.recommendedSong.hookTimestamp}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Current Slide Details */}
            {slides[activeSlideIndex] && (
              <div className="bg-slate-900/80 border border-white/5 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-orange-400">
                    Slide {activeSlideIndex + 1} von 3 Details
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Foto-Slot: #{slides[activeSlideIndex].photoIndex + 1}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Headline Sticker</label>
                    <p className="text-white font-medium bg-slate-950/70 p-2.5 rounded-xl border border-white/5">
                      {slides[activeSlideIndex].hookHeadline}
                    </p>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Gedanken / Sticker Text</label>
                    <p className="text-slate-200 bg-slate-950/70 p-2.5 rounded-xl border border-white/5">
                      {slides[activeSlideIndex].stickerText}
                    </p>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Location Tag</label>
                    <p className="text-orange-300 font-medium bg-slate-950/70 p-2.5 rounded-xl border border-white/5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-400" />
                      {slides[activeSlideIndex].locationSticker}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Full Instagram Feed/Reel Caption */}
            <div className="bg-slate-900/80 border border-white/5 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  Instagram Post / Reel Caption
                </span>
                <button
                  onClick={handleCopyCaption}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-orange-400 flex items-center gap-1.5 transition active:scale-95"
                >
                  {copiedCaption ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Kopiert!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Caption kopieren</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/5 text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line">
                {pkg.fullCaption}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {pkg.hashtags.map((h, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-300 border border-orange-500/20"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
