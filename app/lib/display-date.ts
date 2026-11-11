export function displayDate(value:string):string {
  const match=value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match?`${match[3]}-${match[2]}-${match[1].slice(-2)}`:value;
}

export function displayDateTime(value: string): string {
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return displayDate(value);
  const parts = new Intl.DateTimeFormat('es-PA', {
    timeZone: 'America/Panama', day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(timestamp);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value;
  return `${part('day')}-${part('month')}-${part('year')} · ${part('hour')}:${part('minute')}`;
}
