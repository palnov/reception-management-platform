const DEFAULT_REALTIME_PUBLISH_URL = 'http://127.0.0.1:3006/publish';

export async function publishScheduleChange(month: string) {
  const url =
    process.env.REALTIME_PUBLISH_URL ||
    (process.env.REALTIME_PUBLISH_SECRET ? DEFAULT_REALTIME_PUBLISH_URL : '');
  const secret = process.env.REALTIME_PUBLISH_SECRET;

  if (!url || !secret) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1000);

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-realtime-secret': secret,
      },
      body: JSON.stringify({ type: 'schedule.changed', month }),
      signal: controller.signal,
    });
  } catch (error) {
    console.error('REALTIME_PUBLISH_ERROR:', error);
  } finally {
    clearTimeout(timeout);
  }
}
