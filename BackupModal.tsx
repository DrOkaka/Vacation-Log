import React from 'react';
import { Database, X, Download, Upload, Wand2 } from 'lucide-react';
import { LogEntry } from '../types';

interface BackupModalProps {
  isOpen: boolean;
  entries: LogEntry[];
  onClose: () => void;
  onImport: (entries: LogEntry[]) => void;
  onLoadDemo: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  entries,
  onClose,
  onImport,
  onLoadDemo,
}) => {
  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vacation_log_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImport(parsed);
          onClose();
        } else {
          alert('Ungültiges Backup-Format.');
        }
      } catch (err) {
        alert('Fehler beim Lesen der Datei.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-white/15 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-orange-400" />
            <h3 className="font-display font-bold text-lg text-white">Backup &amp; Datensicherung</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Deine Tagebucheinträge und bearbeiteten Fotos werden persistent in der IndexedDB deines Geräts gespeichert. Du kannst deine Daten jederzeit als JSON exportieren oder auf ein anderes Smartphone übertragen.
        </p>

        <div className="grid grid-cols-1 gap-2.5 pt-1">
          <button
            onClick={handleExportJSON}
            className="w-full py-3 px-4 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-orange-500/30 transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Komplettes Backup herunterladen (.json)</span>
          </button>

          <label className="cursor-pointer w-full py-3 px-4 rounded-xl bg-slate-800 border border-white/10 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-700 transition active:scale-95">
            <Upload className="w-4 h-4" />
            <span>Backup-Datei importieren (.json)</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={() => {
              onLoadDemo();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-white/5 text-slate-400 hover:text-white text-xs flex items-center justify-center gap-2 transition"
          >
            <Wand2 className="w-3.5 h-3.5 text-orange-400" />
            <span>Mallorca Beispiel-Tage laden (Demo)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
