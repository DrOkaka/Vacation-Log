import React from 'react';
import { Palmtree, Smartphone, Bell, Database, WifiOff } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface TopHeaderProps {
  onOpenApkModal: () => void;
  onOpenReminderModal: () => void;
  onOpenBackupModal: () => void;
  isOnline: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenApkModal,
  onOpenReminderModal,
  onOpenBackupModal,
  isOnline,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between no-print">
      {/* Zone 1: Brand wordmark */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
          <Palmtree className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-lg leading-tight tracking-tight text-white whitespace-nowrap">
            Vacation<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-400 to-purple-400">Log AI</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Reise-Journal &amp; Story Creator</span>
        </div>
      </div>

      {/* Zone 2 / 3: Action controls */}
      <div className="flex items-center gap-2 shrink-0">
        {!isOnline && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium" title="Offline-Modus aktiv">
            <WifiOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Offline</span>
          </span>
        )}

        {/* PWA Install Button when installable */}
        {isInstallable && !isInstalled && (
          <button
            onClick={install}
            className="px-2.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm shadow-orange-500/30"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Installieren</span>
          </button>
        )}

        {/* APK / Capacitor Button */}
        <button
          onClick={onOpenApkModal}
          className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-medium text-orange-400 border border-orange-500/30 flex items-center gap-1.5 transition active:scale-95"
          title="Android APK &amp; Installation"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">APK Guide</span>
        </button>

        {/* Daily Reflection Reminder */}
        <button
          onClick={onOpenReminderModal}
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-white/10 transition active:scale-95"
          title="Abend-Erinnerung einstellen"
        >
          <Bell className="w-4 h-4 text-orange-400" />
        </button>

        {/* Backup Modal */}
        <button
          onClick={onOpenBackupModal}
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-white/10 transition active:scale-95"
          title="Backup &amp; Datensicherung"
        >
          <Database className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </header>
  );
};
