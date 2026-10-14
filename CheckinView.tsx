import React, { useState, useEffect } from 'react';
import { Sparkles, ImagePlus, Trash2, CheckCircle2, Wand2, Loader2, RefreshCw, SunMedium, Eye } from 'lucide-react';
import { LogEntry, PhotoItem, FilterPreset } from '../types';
import { compressImage, applyFilterToImage } from '../utils/imageFilters';

interface CheckinViewProps {
  initialEntry?: LogEntry | null;
  onSave: (entry: LogEntry, openStoryStudioImmediately?: boolean) => void;
  onCancel: () => void;
}

export const CheckinView: React.FC<CheckinViewProps> = ({
  initialEntry,
  onSave,
  onCancel,
}) => {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('🤩');
  const [moodLabel, setMoodLabel] = useState('Legendär');
  const [impressions, setImpressions] = useState('');
  const [food, setFood] = useState('');
  const [foodRating, setFoodRating] = useState(5);
  const [moments, setMoments] = useState('');
  const [reflection, setReflection] = useState('');
  const [filterPreset, setFilterPreset] = useState<FilterPreset>('summer-glow');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [showOriginalComparison, setShowOriginalComparison] = useState(false);

  // AI Generation State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiStatusMsg, setAiStatusMsg] = useState('');
  const [aiSummary, setAiSummary] = useState<string | undefined>();
  const [photoInsights, setPhotoInsights] = useState<string | undefined>();
  const [quoteOfTheDay, setQuoteOfTheDay] = useState<string | undefined>();
  const [vibeKeywords, setVibeKeywords] = useState<string[] | undefined>();
  const [instagramPackage, setInstagramPackage] = useState<any | undefined>();

  useEffect(() => {
    if (initialEntry) {
      setDate(initialEntry.date);
      setTitle(initialEntry.title);
      setMood(initialEntry.mood);
      setMoodLabel(initialEntry.moodLabel);
      setImpressions(initialEntry.impressions);
      setFood(initialEntry.food);
      setFoodRating(initialEntry.foodRating);
      setMoments(initialEntry.moments);
      setReflection(initialEntry.reflection);
      setFilterPreset(initialEntry.filterPreset || 'summer-glow');
      setPhotos(initialEntry.photos || []);
      setAiSummary(initialEntry.aiSummary);
      setPhotoInsights(initialEntry.photoInsights);
      setQuoteOfTheDay(initialEntry.quoteOfTheDay);
      setVibeKeywords(initialEntry.vibeKeywords);
      setInstagramPackage(initialEntry.instagramPackage);
    }
  }, [initialEntry]);

  // Handle Photo Upload with Auto-Filter
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = 3 - photos.length;
    if (remaining <= 0) return;

    const newPhotos: PhotoItem[] = [];
    for (const file of files.slice(0, remaining)) {
      const original = await compressImage(file, 1280, 0.82);
      const enhanced = await applyFilterToImage(original, filterPreset);
      newPhotos.push({
        id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        originalUrl: original,
        enhancedUrl: enhanced,
        caption: '',
        filterPreset,
      });
    }

    setPhotos((prev) => [...prev, ...newPhotos]);
    e.target.value = '';
  };

  // Re-apply filter when preset changes
  const changeFilterPreset = async (newPreset: FilterPreset) => {
    setFilterPreset(newPreset);
    const updated = await Promise.all(
      photos.map(async (p) => {
        const enhanced = await applyFilterToImage(p.originalUrl, newPreset);
        return {
          ...p,
          filterPreset: newPreset,
          enhancedUrl: enhanced,
        };
      })
    );
    setPhotos(updated);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCaption = (index: number, val: string) => {
    setPhotos((prev) =>
      prev.map((p, i) => (i === index ? { ...p, caption: val } : p))
    );
  };

  // AI Generation with Gemini 3.8 Flash
  const handleGenerateAI = async () => {
    if (!impressions && !food && !moments && !reflection) {
      alert('Bitte fülle zuerst ein paar Stichpunkte zu deinen Eindrücken, Essen oder Momenten aus!');
      return;
    }

    setIsGeneratingAI(true);
    setAiStatusMsg('Gemini analysiert Fotos & Urlaubseindrücke...');

    try {
      // 1. Analyze Day & Creative Summary
      const res1 = await fetch('/api/ai/analyze-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Urlaubstag',
          date,
          impressions,
          food,
          moments,
          reflection,
          mood,
          moodLabel,
          photos: photos.map((p) => ({ dataUrl: p.originalUrl })),
        }),
      });
      const data1 = await res1.json();
      if (data1.success) {
        setAiSummary(data1.creativeSummary);
        setPhotoInsights(data1.photoInsights);
        setQuoteOfTheDay(data1.quoteOfTheDay);
        setVibeKeywords(data1.vibeKeywords);
      }

      // 2. Generate Instagram Story Package & Song Recommendation
      setAiStatusMsg('Erstelle Instagram 9:16 Story-Sequenzen & passenden Song...');
      const res2 = await fetch('/api/ai/instagram-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Urlaubstag',
          date,
          impressions,
          food,
          moments,
          reflection,
          mood,
          photos: photos.map((p) => ({ dataUrl: p.originalUrl })),
        }),
      });
      const data2 = await res2.json();
      if (data2.success) {
        setInstagramPackage({
          vibe: data2.vibe,
          recommendedSong: data2.recommendedSong,
          slides: data2.slides,
          fullCaption: data2.fullCaption,
          hashtags: data2.hashtags,
        });
      }
    } catch (err) {
      console.error(err);
      alert('Fehler bei der KI-Analyse. Prüfe deine Verbindung oder versuche es erneut.');
    } finally {
      setIsGeneratingAI(false);
      setAiStatusMsg('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: LogEntry = {
      id: initialEntry ? initialEntry.id : 'entry_' + Date.now(),
      date,
      title: title.trim() || 'Tag am Meer',
      mood,
      moodLabel,
      impressions: impressions.trim(),
      food: food.trim(),
      foodRating,
      moments: moments.trim(),
      reflection: reflection.trim(),
      photos,
      filterPreset,
      aiSummary,
      photoInsights,
      quoteOfTheDay,
      vibeKeywords,
      instagramPackage,
      createdAt: initialEntry ? initialEntry.createdAt : Date.now(),
    };

    onSave(entry, !!instagramPackage);
  };

  return (
    <div className="space-y-5 pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white">
            {initialEntry ? 'Eintrag bearbeiten' : 'Abend-Check-in'}
          </h2>
          <p className="text-xs text-slate-400">
            Halte deine Erlebnisse fest und lass dir von Gemini Stories zaubern
          </p>
        </div>
        {initialEntry && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            Abbrechen
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Tag & Ort */}
        <div className="bg-slate-900/80 border border-white/5 rounded-3xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold uppercase tracking-wider">
            <span className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs">
              1
            </span>
            <span>Tag &amp; Ort</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1 font-medium">Datum</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1 font-medium">Titel / Ort des Tages</label>
              <input
                type="text"
                required
                placeholder="z.B. Tag 3 – Cap de Formentor &amp; Bucht"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Mood Selector */}
          <div>
            <label className="block text-xs text-slate-300 mb-2 font-medium">Stimmung heute</label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { emoji: '🤩', label: 'Legendär' },
                { emoji: '😎', label: 'Entspannt' },
                { emoji: '🚴', label: 'Vollgas' },
                { emoji: '🌅', label: 'Dankbar' },
                { emoji: '😴', label: 'K.O.' },
              ].map((item) => (
                <button
                  key={item.emoji}
                  type="button"
                  onClick={() => {
                    setMood(item.emoji);
                    setMoodLabel(item.label);
                  }}
                  className={`p-2.5 rounded-2xl flex flex-col items-center gap-1 transition ${
                    mood === item.emoji
                      ? 'bg-orange-500/20 border-2 border-orange-500 scale-105 shadow-sm'
                      : 'bg-slate-950/80 border border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-[10px] text-slate-300 font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Eindrücke */}
        <div className="bg-slate-900/80 border border-white/5 rounded-3xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold uppercase tracking-wider">
            <span className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs">
              2
            </span>
            <span>Deine Eindrücke</span>
          </div>
          <p className="text-xs text-slate-400">
            Wie war die Atmosphäre, das Wetter, die Strecke oder der Ort?
          </p>
          <textarea
            rows={3}
            required
            placeholder="Heute früh los, die Luft war noch kühl und roch nach Pinien..."
            value={impressions}
            onChange={(e) => setImpressions(e.target.value)}
            className="w-full rounded-2xl bg-slate-950/80 border border-slate-700/80 p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* 3. Kulinarik */}
        <div className="bg-slate-900/80 border border-white/5 rounded-3xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 text-xs">
                3
              </span>
              <span>Bestes Essen</span>
            </div>
            <span className="text-xs text-slate-400">🍽️ Food-Highlight</span>
          </div>
          <input
            type="text"
            required
            placeholder="z.B. Gegrillter Pulpo &amp; Paella in der kleinen Hafen-Bodega"
            value={food}
            onChange={(e) => setFood(e.target.value)}
            className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">Geschmacks-Bewertung:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFoodRating(s)}
                  className={`text-xl transition ${
                    s <= foodRating ? 'text-amber-400 scale-110' : 'text-slate-600'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Momente & Reflexion */}
        <div className="bg-slate-900/80 border border-white/5 rounded-3xl p-4 sm:p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs">
                4
              </span>
              <span>Schönster Moment</span>
            </div>
            <textarea
              rows={2}
              required
              placeholder="Der erste kalte Schluck nach dem Anstieg am Meer, Sonnenuntergang..."
              value={moments}
              onChange={(e) => setMoments(e.target.value)}
              className="w-full rounded-2xl bg-slate-950/80 border border-slate-700/80 p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs">
                5
              </span>
              <span>Gedanken &amp; Reflexion</span>
            </div>
            <textarea
              rows={2}
              required
              placeholder="Der Kopf ist endlich frei vom Alltag. Wie gut es tut, offline zu sein..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="w-full rounded-2xl bg-slate-950/80 border border-slate-700/80 p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* 6. Die 2-3 schönsten Fotos mit Sommer-Glow Bearbeitung */}
        <div className="bg-slate-900/80 border border-white/5 rounded-3xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">
                6
              </span>
              <span>2–3 Lieblingsfotos (Sommer-Glow)</span>
            </div>
            <span className="text-xs text-slate-400 tabular-nums">{photos.length} / 3 gewählt</span>
          </div>

          {/* Filter Preset Picker */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <SunMedium className="w-3.5 h-3.5 text-amber-400" />
                Automatischer Foto-Filter:
              </span>
              <button
                type="button"
                onClick={() => setShowOriginalComparison(!showOriginalComparison)}
                className="text-[11px] text-orange-400 hover:underline flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                <span>{showOriginalComparison ? 'Glow-Filter zeigen' : 'Original vergleichen'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {[
                { id: 'summer-glow', label: '☀️ Sommer-Glow' },
                { id: 'golden-hour', label: '🌅 Golden Hour' },
                { id: 'mediterranean-sun', label: '🌊 Mediterran' },
                { id: 'vintage-film', label: '🎞️ 35mm Film' },
                { id: 'natural-clean', label: '🌿 Natural Clean' },
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => changeFilterPreset(preset.id as FilterPreset)}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-medium border text-left transition ${
                    filterPreset === preset.id
                      ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Uploaded Photos Grid */}
          {photos.length > 0 && (
            <div className="space-y-3 pt-2">
              {photos.map((p, idx) => (
                <div
                  key={p.id}
                  className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center gap-3"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10">
                    <img
                      src={showOriginalComparison ? p.originalUrl : p.enhancedUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 text-[8px] bg-black/70 px-1 rounded text-white font-mono">
                      {showOriginalComparison ? 'Orig' : 'Glow'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Bildunterschrift (z.B. Ausblick vom Pass)..."
                      value={p.caption}
                      onChange={(e) => updateCaption(idx, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="p-2 rounded-xl bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {photos.length < 3 && (
            <label className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-orange-500/60 rounded-2xl p-5 bg-slate-950/40 transition">
              <ImagePlus className="w-7 h-7 text-orange-400 mb-1" />
              <span className="text-xs font-semibold text-white">Fotos aus Galerie auswählen</span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Werden automatisch mit warmem Sommer-Glow veredelt
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* 7. KI-Assistent Button: Veredeln & Stories generieren */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-orange-500/15 via-rose-500/15 to-purple-500/15 border border-orange-500/30 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                Gemini KI-Magie
              </span>
              <p className="text-xs text-white font-medium">
                Bilder auswerten, kreatives Recap &amp; 3-Slide Instagram Stories mit Song erstellen
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isGeneratingAI}
            onClick={handleGenerateAI}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:opacity-95 transition disabled:opacity-50"
          >
            {isGeneratingAI ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{aiStatusMsg || 'KI arbeitet...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {aiSummary ? 'KI-Stories & Zusammenfassung neu generieren' : '✨ KI-Zusammenfassung & Stories zaubern'}
                </span>
              </>
            )}
          </button>

          {/* AI Output Preview Preview Box */}
          {aiSummary && (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2 text-xs">
              <p className="font-semibold text-orange-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Kreative Zusammenfassung bereit:
              </p>
              <p className="text-slate-300 leading-relaxed italic">„{aiSummary}“</p>

              {quoteOfTheDay && (
                <p className="text-amber-300 text-[11px] pt-1">
                  Mantra: „{quoteOfTheDay}“
                </p>
              )}

              {instagramPackage && (
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-rose-400 font-semibold">
                    🎵 Song: {instagramPackage.recommendedSong?.title} – {instagramPackage.recommendedSong?.artist}
                  </span>
                  <span className="text-slate-400">3 Story-Slides bereit</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-600 to-purple-600 text-white font-display font-bold text-base shadow-xl shadow-orange-500/25 hover:opacity-95 transition active:scale-98 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Tag im Urlaubs-Journal speichern</span>
          </button>
        </div>
      </form>
    </div>
  );
};
