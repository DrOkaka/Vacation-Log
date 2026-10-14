import React from 'react';
import { Printer, Camera, Utensils, Brain, Sparkles, Star } from 'lucide-react';
import { LogEntry } from '../types';

interface RecapViewProps {
  entries: LogEntry[];
  onOpenPhotoLightbox: (url: string, caption: string) => void;
}

export const RecapView: React.FC<RecapViewProps> = ({ entries, onOpenPhotoLightbox }) => {
  const totalDays = entries.length;
  const allPhotos = entries.flatMap((e) =>
    (e.photos || []).map((p) => ({
      ...p,
      dayTitle: e.title,
      date: e.date,
    }))
  );

  const moodCounts: Record<string, number> = {};
  entries.forEach((e) => {
    if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
  });

  let topMood = '–';
  let maxCount = 0;
  for (const [m, count] of Object.entries(moodCounts)) {
    if (count > maxCount) {
      maxCount = count;
      topMood = m;
    }
  }

  const formatGermanDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Recap Banner */}
      <div className="bg-slate-900/80 border border-orange-500/30 rounded-3xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-orange-400">
              Dein Reise-Rückblick
            </span>
            <h2 className="font-display text-2xl font-bold text-white mt-0.5">Urlaubs-Recap</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Alle Highlights, besten Gerichte, Gedanken und deine schönsten Bilder auf einen Blick.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print shrink-0 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 border border-white/10 transition active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 text-orange-400" />
            <span>PDF / Druck</span>
          </button>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-slate-950/80 rounded-2xl p-3 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase">Reisetage</span>
            <p className="font-display text-xl font-bold text-white mt-0.5 tabular-nums">{totalDays}</p>
          </div>
          <div className="bg-slate-950/80 rounded-2xl p-3 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase">Top-Stimmung</span>
            <p className="font-display text-xl font-bold text-orange-400 mt-0.5">{topMood}</p>
          </div>
          <div className="bg-slate-950/80 rounded-2xl p-3 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase">Kulinarik-Hits</span>
            <p className="font-display text-xl font-bold text-rose-400 mt-0.5 tabular-nums">
              {entries.filter((e) => e.food).length}
            </p>
          </div>
          <div className="bg-slate-950/80 rounded-2xl p-3 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase">Glow-Fotos</span>
            <p className="font-display text-xl font-bold text-emerald-400 mt-0.5 tabular-nums">
              {allPhotos.length}
            </p>
          </div>
        </div>
      </div>

      {/* Best of Photos Gallery */}
      <div className="space-y-3">
        <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
          <Camera className="w-4 h-4 text-emerald-400" />
          <span>Die schönsten Bilder des Urlaubs ({allPhotos.length})</span>
        </h3>
        {allPhotos.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center bg-slate-900/60 rounded-2xl">
            Noch keine Fotos hochgeladen.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {allPhotos.map((p) => (
              <div
                key={p.id}
                onClick={() => onOpenPhotoLightbox(p.enhancedUrl || p.originalUrl, p.caption || p.dayTitle)}
                className="group relative rounded-2xl overflow-hidden aspect-square cursor-pointer border border-white/10 bg-slate-900"
              >
                <img
                  src={p.enhancedUrl || p.originalUrl}
                  alt={p.caption || 'Urlaubsbild'}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5">
                  <p className="text-[11px] font-medium text-white truncate">{p.caption || p.dayTitle}</p>
                  <p className="text-[9px] text-orange-300 truncate">{formatGermanDate(p.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hall of Fame: Beste Essen */}
      <div className="space-y-3">
        <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
          <Utensils className="w-4 h-4 text-rose-400" />
          <span>Kulinarische Highlights (Beste Essen)</span>
        </h3>
        <div className="space-y-2.5">
          {entries
            .filter((e) => e.food)
            .map((entry) => (
              <div
                key={entry.id}
                className="bg-slate-900/80 border border-white/5 rounded-2xl p-3.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 font-bold text-sm">
                    🍽️
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{entry.food}</p>
                    <p className="text-[11px] text-slate-400">
                      {entry.title} · {formatGermanDate(entry.date)}
                    </p>
                  </div>
                </div>
                <span className="text-amber-400 text-xs shrink-0 flex items-center">
                  {'★'.repeat(entry.foodRating || 5)}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Momente & Gedanken */}
      <div className="space-y-3">
        <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <span>Momente &amp; Reflexionen der Reise</span>
        </h3>
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-slate-900/80 border border-white/5 rounded-2xl p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-orange-400">{entry.title}</span>
                <span>{formatGermanDate(entry.date)}</span>
              </div>
              {entry.moments && (
                <div className="text-xs">
                  <span className="text-amber-400 font-semibold">✨ Schönster Moment:</span>
                  <span className="text-slate-200 ml-1">{entry.moments}</span>
                </div>
              )}
              {entry.reflection && (
                <div className="text-xs bg-slate-950/70 p-2.5 rounded-xl border border-white/5">
                  <span className="text-purple-400 font-semibold">💭 Reflexion:</span>
                  <span className="text-slate-300 italic ml-1">„{entry.reflection}“</span>
                </div>
              )}
              {entry.aiSummary && (
                <div className="text-xs bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/20">
                  <span className="text-orange-400 font-semibold flex items-center gap-1 mb-0.5">
                    <Sparkles className="w-3 h-3" /> KI-Recap:
                  </span>
                  <span className="text-slate-300">{entry.aiSummary}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
