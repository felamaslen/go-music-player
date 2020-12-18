import pluralize from 'pluralize';

export function formatTime(seconds: number | null): string {
  if (seconds == null) {
    return '';
  }

  const totalSecondsAbsolute = Math.abs(seconds);
  const sign = seconds < 0 ? '-' : '';

  const hours = Math.floor(totalSecondsAbsolute / 3600);
  const afterHours = totalSecondsAbsolute % 3600;

  const minutes = Math.floor(afterHours / 60);
  const remainingSeconds = afterHours % 60;

  const minutesSeconds = `${minutes
    .toFixed()
    .padStart(2, '0')}:${remainingSeconds.toFixed().padStart(2, '0')}`;

  if (!hours) {
    return `${sign}${minutesSeconds}`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  const time = remainingHours ? `${remainingHours.toFixed()}:${minutesSeconds}` : minutesSeconds;

  if (!days) {
    return `${sign}${time}`;
  }

  return `${sign}${pluralize('day', days, true)}, ${time}`;
}
