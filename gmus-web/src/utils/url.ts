export function getApiUrl(): string {
  const baseUrl = process.env.REACT_APP_API_URL ?? 'http://localhost:3000';
  if (baseUrl.startsWith('//')) {
    return `${window.location.protocol}${baseUrl}`;
  }
  return baseUrl;
}

export function getPubsubUrl(): string {
  const apiUrl = new URL(getApiUrl());
  return `${apiUrl.protocol === 'https:' ? 'wss' : 'ws'}://${apiUrl.hostname}${
    apiUrl.port ? `:${apiUrl.port}` : ''
  }${apiUrl.pathname}${apiUrl.pathname === '/' ? '' : '/'}pubsub`;
}

export function getSongUrl(songId: number): string {
  return `${process.env.REACT_APP_API_URL}/stream?songid=${songId}`;
}
