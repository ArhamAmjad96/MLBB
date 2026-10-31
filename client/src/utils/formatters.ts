export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatGold(gold: number): string {
  if (gold >= 1000) {
    return `${(gold / 1000).toFixed(1)}k`;
  }
  return gold.toString();
}
