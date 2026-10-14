/**
 * VacationLog AI - Push & Daily Reflection Notification Manager
 */

export interface ReminderConfig {
  enabled: boolean;
  time: string; // HH:mm format, e.g. "20:00"
  lastTriggeredDate?: string;
}

const STORAGE_KEY = 'vacation_reminder_config';

export function getReminderConfig(): ReminderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return { enabled: true, time: '20:00' };
}

export function saveReminderConfig(config: ReminderConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const result = await Notification.requestPermission();
    return result === 'granted';
  }
  return false;
}

export function hasNotificationPermission(): boolean {
  if (!('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

/**
 * Fires a notification immediately via ServiceWorker or fallback Notification API
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  tag = 'vacation-reflection'
): Promise<boolean> {
  const granted = await requestNotificationPermission();
  if (!granted) return false;

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/icon.svg',
          tag,
          vibrate: [200, 100, 200],
          data: { url: '/' },
        } as any);
        return true;
      }
    }
    // Fallback standard notification
    new Notification(title, {
      body,
      icon: '/pwa-192x192.png',
      tag,
    });
    return true;
  } catch (err) {
    console.warn('Notification failed, falling back:', err);
    try {
      new Notification(title, { body, icon: '/pwa-192x192.png' });
      return true;
    } catch (e) {
      return false;
    }
  }
}

/**
 * Checks if the scheduled reflection notification should trigger.
 * Called on app mount and background interval.
 */
export function checkScheduledReflection(): void {
  const config = getReminderConfig();
  if (!config.enabled || !hasNotificationPermission()) return;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (config.lastTriggeredDate === todayStr) return;

  const [hours, minutes] = config.time.split(':').map((v) => parseInt(v, 10));
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  // If time has passed today (e.g. >= 20:00)
  if (currentHours > hours || (currentHours === hours && currentMinutes >= minutes)) {
    sendLocalNotification(
      '🌅 Zeit für deinen Urlaubs-Check-in',
      'Wie war dein Tag heute? Halte deine schönsten Momente, das beste Essen & Fotos fest!',
      `evening-reminder-${todayStr}`
    );
    config.lastTriggeredDate = todayStr;
    saveReminderConfig(config);
  }
}
