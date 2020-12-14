export function getPubsubUrl(): string {
  const apiUrl = new URL(process.env.REACT_APP_API_URL ?? 'http://localhost:3000');
  return `${apiUrl.protocol === 'https:' ? 'wss' : 'ws'}://${apiUrl.hostname}${
    apiUrl.port ? `:${apiUrl.port}` : ''
  }/pubsub`;
}
