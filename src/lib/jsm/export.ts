export function exportJSM(name: string, raw: string) {
  let formatted: string;
  try {
    formatted = JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    formatted = raw;
  }
  const blob = new Blob([formatted], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/\s+/g, '-').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
