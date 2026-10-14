import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, Clock, Send, AlertCircle } from 'lucide-react';
import {
  getReminderConfig,
  saveReminderConfig,
  requestNotificationPermission,
  sendLocalNotification,
  hasNotificationPermission,
  ReminderConfig,
} from '../utils/notifications';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<ReminderConfig>(getReminderConfig());
  const [permissionGranted, setPermissionGranted] = useState(hasNotificationPermission());
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getReminderConfig());
      setPermissionGranted(hasNotificationPermission());
      setTestSent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = () => {
    const updated = { ...config, enabled: !config.enabled };
    setConfig(updated);
    saveReminderConfig(updated);
  };

  const handleTimeChange = (time: string) => {
    const updated = { ...config, time };
    setConfig(updated);
    saveReminderConfig(updated);
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    if (granted) {
      sendLocalNotification(
        '🎉 Benachrichtigungen aktiviert!',
        'Du erhältst ab jetzt jeden Abend eine Erinnerung für deine Reflexion & Storys.'
      );
    }
  };

  const handleSendTestPush = async () => {
    const success = await sendLocalNotification(
      '🌅 Zeit für deinen Urlaubs-Check-in',
      'Wie war dein Tag heute? Halte deine schönsten Momente, das beste Essen & Fotos fest!'
    );
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } else {
      alert('Bitte erlaube zuerst Benachrichtigungen in deinem Browser.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-white/15 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Abend-Reflexion Push</h3>
              <p className="text-[11px] text-slate-400">Tägliche Erinnerung für deinen Urlaubs-Log</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Banner */}
        {!permissionGranted ? (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-white">Browser-Erlaubnis erforderlich</p>
              <p className="text-[11px] text-slate-300">
                Damit die App dich abends an deinen Check-in erinnern kann, erteile bitte die Benachrichtigungs-Berechtigung.
              </p>
              <button
                onClick={handleRequestPermission}
                className="mt-1 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-xs transition active:scale-95"
              >
                Benachrichtigungen erlauben
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Push-Benachrichtigungen sind aktiv und einsatzbereit.</span>
          </div>
        )}

        <div className="space-y-3 pt-1">
          {/* Toggle Active */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-white/5">
            <div>
              <p className="text-xs font-semibold text-white">Tägliche Erinnerung</p>
              <p className="text-[11px] text-slate-400">Jeden Abend nach dem Sonnenuntergang</p>
            </div>
            <button
              onClick={handleToggle}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                config.enabled ? 'bg-orange-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  config.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Time Picker */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-white/5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <div>
                <p className="text-xs font-semibold text-white">Uhrzeit</p>
                <p className="text-[11px] text-slate-400">Empfohlen: 20:00 oder 21:00 Uhr</p>
              </div>
            </div>
            <input
              type="time"
              value={config.time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Test Push Button */}
          <button
            onClick={handleSendTestPush}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-white/10 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Send className="w-3.5 h-3.5 text-orange-400" />
            <span>{testSent ? 'Test-Push gesendet! 🎉' : 'Test-Push jetzt senden'}</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition"
        >
          Fertig
        </button>
      </div>
    </div>
  );
};
