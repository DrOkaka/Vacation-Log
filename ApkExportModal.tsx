import React, { useState } from 'react';
import { Smartphone, X, Zap, Package, Terminal, Copy, Check, ExternalLink } from 'lucide-react';

interface ApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkExportModal: React.FC<ApkExportModalProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const capacitorCommands = `# 1. App für Produktion bauen
npm run build

# 2. Capacitor Android Projekt initialisieren
npx cap add android

# 3. Web-Assets in Android-Projekt synchronisieren
npx cap sync android

# 4. In Android Studio öffnen & APK bauen:
npx cap open android
# In Android Studio Menü: "Build" > "Build Bundle(s) / APK(s)" > "Build APK(s)"`;

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(capacitorCommands);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-white/15 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-rose-600 flex items-center justify-center text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Als Android App &amp; APK nutzen</h3>
              <p className="text-[11px] text-slate-400">Offline-fähig mit Push-Nachrichten</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
          {/* Option 1: PWA (Sofort auf dem Handy) */}
          <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 space-y-2">
            <p className="font-semibold text-orange-400 text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-300" />
              Option 1: Sofort als App auf Android installieren (10 Sekunden)
            </p>
            <p className="text-slate-300">
              Du brauchst gar kein Android Studio, um die App mit eigenem Icon auf dem Homescreen zu haben:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>Öffne diese App in <strong>Google Chrome</strong> auf deinem Android-Smartphone.</li>
              <li>Tippe oben rechts auf das <strong>Drei-Punkte-Menü (⋮)</strong>.</li>
              <li>Wähle <strong>„Zum Startbildschirm hinzufügen“</strong> oder <strong>„App installieren“</strong>.</li>
              <li>Fertig! Sie startet im Vollbildmodus ohne Browserleiste und funktioniert komplett offline.</li>
            </ol>
          </div>

          {/* Option 2: Capacitor Native APK */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-white text-sm flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Option 2: Native Android <code className="text-emerald-400">.apk</code> via Capacitor
              </p>
              <button
                onClick={handleCopyCommands}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-emerald-400 flex items-center gap-1"
              >
                {copiedCmd ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd ? 'Kopiert' : 'Befehle kopieren'}</span>
              </button>
            </div>
            <p className="text-slate-400 text-[11px]">
              Die Datei <code className="text-orange-300">capacitor.config.ts</code> ist in deinem Projekt bereits fertig eingerichtet. Führe im Terminal einfach folgendes aus:
            </p>
            <pre className="p-3 rounded-xl bg-slate-900 border border-white/5 font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre">
              {capacitorCommands}
            </pre>
          </div>

          {/* Option 3: WebIntoApp 1-Klick Cloud-Builder */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-white text-sm flex items-center gap-1.5">
                <Package className="w-4 h-4 text-purple-400" />
                Option 3: Online APK-Generator (WebIntoApp / PWA2APK)
              </p>
              <a
                href="https://www.webintoapp.com"
                target="_blank"
                rel="noreferrer"
                className="text-purple-300 text-[11px] hover:underline flex items-center gap-1"
              >
                <span>Öffnen</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-400 text-[11px]">
              Gib auf <strong>webintoapp.com</strong> die URL dieser App ein (oder lade den <code className="text-slate-300">dist/</code>-Ordner hoch). Dort wird dir automatisch innerhalb von 1 Minute eine downloadbare <code className="text-purple-300">.apk</code>-Datei generiert.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
        >
          Schließen
        </button>
      </div>
    </div>
  );
};
