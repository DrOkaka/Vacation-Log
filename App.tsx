/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Compass, Plus, Instagram, Sparkles, CheckCircle2 } from 'lucide-react';
import { LogEntry } from './types';
import { getAllEntries, saveEntry, deleteEntry, seedDemoData } from './utils/db';
import { checkScheduledReflection } from './utils/notifications';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { CheckinView } from './components/CheckinView';
import { StoryStudioView } from './components/StoryStudioView';
import { RecapView } from './components/RecapView';
import { ApkExportModal } from './components/ApkExportModal';
import { ReminderModal } from './components/ReminderModal';
import { BackupModal } from './components/BackupModal';
import { LightboxModal } from './components/LightboxModal';

type ActiveTab = 'dashboard' | 'checkin' | 'story-studio' | 'recap';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);
  const [selectedStoryEntryId, setSelectedStoryEntryId] = useState<string>('');

  // Online / Offline State
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Modals
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [lightboxData, setLightboxData] = useState<{ isOpen: boolean; url: string; caption: string }>({
    isOpen: false,
    url: '',
    caption: '',
  });

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 2800);
  };

  // Load entries on mount
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAllEntries();
        setEntries(data);
      } catch (err) {
        console.error('Error loading entries:', err);
      }
    }
    loadData();

    // Online / Offline event listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check for scheduled reflection alarm
    checkScheduledReflection();
    const interval = setInterval(checkScheduledReflection, 60000); // Check every minute

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleSaveEntry = async (entry: LogEntry, openStoryStudioImmediately = false) => {
    try {
      await saveEntry(entry);
      const freshEntries = await getAllEntries();
      setEntries(freshEntries);
      setEditingEntry(null);

      if (openStoryStudioImmediately) {
        setSelectedStoryEntryId(entry.id);
        setActiveTab('story-studio');
        showToast('Tag & Instagram Stories erfolgreich gespeichert!');
      } else {
        setActiveTab('dashboard');
        showToast('Urlaubstag erfolgreich gespeichert!');
      }
    } catch (err) {
      console.error(err);
      showToast('Fehler beim Speichern');
    }
  };

  const handleUpdateEntryDirectly = async (entry: LogEntry) => {
    try {
      await saveEntry(entry);
      const freshEntries = await getAllEntries();
      setEntries(freshEntries);
      showToast('Eintrag aktualisiert!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('Möchtest du diesen Eintrag wirklich löschen?')) {
      try {
        await deleteEntry(id);
        const freshEntries = await getAllEntries();
        setEntries(freshEntries);
        showToast('Eintrag gelöscht');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLoadDemo = async () => {
    try {
      const demoEntries = await seedDemoData();
      setEntries(demoEntries);
      showToast('Mallorca Beispiel-Tage erfolgreich geladen!');
    } catch (err) {
      console.error(err);
      showToast('Fehler beim Laden der Demo-Daten');
    }
  };

  const handleEditEntry = (entry: LogEntry) => {
    setEditingEntry(entry);
    setActiveTab('checkin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStoryStudio = (entry: LogEntry) => {
    setSelectedStoryEntryId(entry.id);
    setActiveTab('story-studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLightbox = (url: string, caption: string) => {
    setLightboxData({ isOpen: true, url, caption });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Top Header */}
      <TopHeader
        isOnline={isOnline}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        onOpenReminderModal={() => setIsReminderModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-lg lg:max-w-4xl w-full mx-auto px-4 pt-4">
        {activeTab === 'dashboard' && (
          <DashboardView
            entries={entries}
            onOpenCheckin={() => {
              setEditingEntry(null);
              setActiveTab('checkin');
            }}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            onOpenStoryStudio={handleOpenStoryStudio}
            onOpenPhotoLightbox={handleOpenLightbox}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {activeTab === 'checkin' && (
          <CheckinView
            initialEntry={editingEntry}
            onSave={handleSaveEntry}
            onCancel={() => {
              setEditingEntry(null);
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'story-studio' && (
          <StoryStudioView
            entries={entries}
            selectedEntryId={selectedStoryEntryId}
            onUpdateEntry={handleUpdateEntryDirectly}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'recap' && (
          <RecapView
            entries={entries}
            onOpenPhotoLightbox={handleOpenLightbox}
          />
        )}
      </main>

      {/* Bottom Navigation Bar (Mobile App Feel & Thumb Ergonomics) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/90 backdrop-blur-md border-t border-white/10 px-4 py-2 no-print">
        <div className="max-w-md mx-auto grid grid-cols-4 items-center">
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === 'dashboard' ? 'text-orange-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight">Tages-Log</span>
          </button>

          {/* Tab 2: Check-in (+) */}
          <button
            onClick={() => {
              setEditingEntry(null);
              setActiveTab('checkin');
            }}
            className="flex flex-col items-center justify-center -mt-5"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 via-rose-500 to-purple-600 text-white shadow-lg shadow-orange-500/30 flex items-center justify-center transform transition active:scale-95">
              <Plus className="w-6 h-6" />
            </div>
            <span className={`text-[10px] mt-1 font-semibold ${activeTab === 'checkin' ? 'text-orange-400' : 'text-slate-300'}`}>
              Check-in
            </span>
          </button>

          {/* Tab 3: Story Studio */}
          <button
            onClick={() => setActiveTab('story-studio')}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === 'story-studio' ? 'text-orange-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Instagram className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight">Stories</span>
          </button>

          {/* Tab 4: Recap */}
          <button
            onClick={() => setActiveTab('recap')}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === 'recap' ? 'text-orange-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight">Recap</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <ApkExportModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        entries={entries}
        onClose={() => setIsBackupModalOpen(false)}
        onImport={async (imported) => {
          for (const item of imported) {
            await saveEntry(item);
          }
          const fresh = await getAllEntries();
          setEntries(fresh);
          showToast('Backup erfolgreich importiert!');
        }}
        onLoadDemo={handleLoadDemo}
      />

      <LightboxModal
        isOpen={lightboxData.isOpen}
        imageUrl={lightboxData.url}
        caption={lightboxData.caption}
        onClose={() => setLightboxData({ isOpen: false, url: '', caption: '' })}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-semibold text-xs shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
