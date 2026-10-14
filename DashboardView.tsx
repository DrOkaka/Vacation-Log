import React from 'react';
import { PenLine, History, Sparkles, Utensils, Heart, CalendarDays, Instagram, Trash2, Edit3, Image as ImageIcon } from 'lucide-react';
import { LogEntry } from '../types';

interface DashboardViewProps {
  entries: LogEntry[];
  onOpenCheckin: () => void;
  onEditEntry: (entry: LogEntry) => void;
  onDeleteEntry: (id: string) => void;
  onOpenStoryStudio: (entry: LogEntry) => void;
  onOpenPhotoLightbox: (url: string, caption: string) => void;
  onLoadDemo: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  entries,
  onOpenCheckin,
  onEditEntry,
  onDeleteEntry,
  onOpenStoryStudio,
  onOpenPhotoLightbox,
  onLoadDemo,
}) => {
  const totalDays = entries.length;
  const totalPhotos = entries.reduce((acc, e) => acc + (e.photos ? e.photos.length : 0), 0);
  const totalFoods = entries.filter((e) => e.food && e.food.trim().length > 0).length;

  const latestEntry = entries[0];
  const todayStr = new Date().toISOString().split('T')[0];
  const isYesterday = entries.length > 1 && entries[0].date === todayStr ? entries[1] : entries[0];

  const formatGermanDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Hero Greeting & Quick Check-in CTA */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-orange-500 via-rose-600 to-purple-700 shadow-xl shadow-orange-600/20">
        <div className="relative z-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/30 text-white backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Abend-Reflexion &amp; Story Creator
          </span>
          <h2 className="font-display text-2xl font-bold text-white leading-snug">
            Wie war dein Urlaubstag heute?
          </h2>
          <p className="text-white/85 text-xs leading-relaxed max-w-sm">
            Halte deine Erlebnisse, das beste Essen und deine 2–3 Lieblingsfotos fest. Die KI veredelt die Fotos mit warmem Sommer-Glow und schreibt deine Instagram-Storys.
          </p>
          <div className="pt-1 flex flex-wrap gap-2.5">
            <button
              onClick={onOpenCheckin}
              className="px-5 py-3 rounded-2xl bg-white text-slate-950 font-semibold text-sm shadow-lg hover:bg-slate-100 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <PenLine className="w-4 h-4 text-orange-600" />
              <span>Heutigen Tag eintragen</span>
            </button>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-3.5 text-center">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Reisetage</p>
          <p className="font-display text-2xl font-bold text-white mt-0.5 tabular-nums">{totalDays}</p>
        </div>
        <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-3.5 text-center">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Fotos</p>
          <p className="font-display text-2xl font-bold text-orange-400 mt-0.5 tabular-nums">{totalPhotos}</p>
        </div>
        <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-3.5 text-center">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Food-Spots</p>
          <p className="font-display text-2xl font-bold text-rose-400 mt-0.5 tabular-nums">{totalFoods}</p>
        </div>
      </div>

      {/* Rückblick: Letzter Log / Gestern-Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <History className="w-4 h-4 text-orange-400" />
            <h3 className="font-display font-bold text-base">Rückblick: Dein letzter Log</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {totalDays > 0 ? formatGermanDate(isYesterday.date) : 'Noch leer'}
          </span>
        </div>

        {totalDays === 0 ? (
          <div className="bg-slate-900/60 rounded-3xl p-6 text-center space-y-4 border border-dashed border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/15 text-orange-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="font-display font-semibold text-base text-white">Noch kein Reisetag vorhanden</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                Starte deinen ersten Abend-Check-in oder lade dir zum Testen direkt die Mallorca-Beispieldaten.
              </p>
            </div>
            <button
              onClick={onLoadDemo}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-orange-400 border border-orange-500/30 transition active:scale-95"
            >
              Mallorca Beispiel-Tage laden
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-orange-500/10 via-slate-900/90 to-slate-900 rounded-3xl p-5 border border-orange-500/30 space-y-4 shadow-lg shadow-black/40">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-semibold text-orange-400">{formatGermanDate(isYesterday.date)}</span>
                <h4 className="font-display font-bold text-lg text-white flex items-center gap-2 mt-0.5">
                  <span>{isYesterday.mood}</span>
                  <span>{isYesterday.title}</span>
                </h4>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] bg-white/10 text-slate-200">
                {isYesterday.moodLabel}
              </span>
            </div>

            {/* AI Summary Highlight */}
            {isYesterday.aiSummary ? (
              <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-xs space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-orange-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-orange-400" /> KI-Zusammenfassung des Tages
                </p>
                <p className="text-slate-200 leading-relaxed italic">{isYesterday.aiSummary}</p>
                {isYesterday.quoteOfTheDay && (
                  <p className="text-[11px] text-amber-300 font-medium pt-1">
                    „{isYesterday.quoteOfTheDay}“
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-200 leading-relaxed">{isYesterday.impressions}</p>
            )}

            {/* Food & Moments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1">
                  <Utensils className="w-3 h-3" /> Bestes Essen
                </p>
                <p className="text-slate-100 font-medium mt-0.5">{isYesterday.food || '–'}</p>
                <p className="text-amber-400 text-xs mt-0.5">{'★'.repeat(isYesterday.foodRating || 5)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1">
                  <Heart className="w-3 h-3" /> Schönster Moment
                </p>
                <p className="text-slate-100 mt-0.5 line-clamp-2">{isYesterday.moments || '–'}</p>
              </div>
            </div>

            {/* Photos Preview */}
            {isYesterday.photos && isYesterday.photos.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {isYesterday.photos.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onOpenPhotoLightbox(p.enhancedUrl || p.originalUrl, p.caption || isYesterday.title)}
                      className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-square bg-slate-900 border border-white/10"
                    >
                      <img
                        src={p.enhancedUrl || p.originalUrl}
                        alt={p.caption || 'Foto'}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-semibold text-amber-300">
                        Sommer-Glow
                      </div>
                      {p.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2">
                          <p className="text-[10px] text-white truncate">{p.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Jump to Instagram Story Studio */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/10">
              <button
                onClick={() => onOpenStoryStudio(isYesterday)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 hover:opacity-95 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 active:scale-98 transition"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram Stories &amp; Song öffnen</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chronologische Timeline aller Tage */}
      {entries.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-rose-400" />
              <span>Alle Urlaubstage ({entries.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {entries.map((entry) => (
              <article
                key={entry.id}
                className="bg-slate-900/80 border border-white/5 rounded-3xl p-5 space-y-3 hover:border-white/15 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-orange-400">{formatGermanDate(entry.date)}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {entry.mood} {entry.moodLabel}
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-base text-white mt-1">{entry.title}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenStoryStudio(entry)}
                      className="p-2 rounded-xl bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                      title="Story Studio"
                    >
                      <Instagram className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditEntry(entry)}
                      className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white"
                      title="Bearbeiten"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-2 rounded-xl bg-slate-800/80 text-rose-400 hover:bg-rose-500/20"
                      title="Löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{entry.impressions}</p>

                {entry.food && (
                  <div className="text-xs text-slate-300 flex items-center gap-1.5">
                    <span className="text-rose-400">🍽️</span>
                    <span className="font-medium text-white">{entry.food}</span>
                    <span className="text-amber-400 text-[11px]">{'★'.repeat(entry.foodRating || 5)}</span>
                  </div>
                )}

                {/* Photos mini-strip */}
                {entry.photos && entry.photos.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
                    {entry.photos.map((p) => (
                      <img
                        key={p.id}
                        src={p.enhancedUrl || p.originalUrl}
                        alt="Foto"
                        onClick={() => onOpenPhotoLightbox(p.enhancedUrl || p.originalUrl, p.caption || entry.title)}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 cursor-pointer border border-white/10 hover:opacity-80 transition"
                      />
                    ))}
                    <button
                      onClick={() => onOpenStoryStudio(entry)}
                      className="h-14 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1.5 shrink-0"
                    >
                      <Instagram className="w-3.5 h-3.5 text-orange-400" />
                      <span>Stories</span>
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
