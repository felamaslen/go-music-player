export function getApiUrl(): string {
  return process.env.REACT_APP_API_URL ?? 'http://localhost:3000';
}

export function getPubsubUrl(): string {
  const apiUrl = new URL(getApiUrl());
  return `${apiUrl.protocol === 'https:' ? 'wss' : 'ws'}://${apiUrl.hostname}${
    apiUrl.port ? `:${apiUrl.port}` : ''
  }/pubsub`;
}

export function getSongUrl(songId: number): string {
  return `${process.env.REACT_APP_API_URL}/stream?songid=${songId}`;
}
