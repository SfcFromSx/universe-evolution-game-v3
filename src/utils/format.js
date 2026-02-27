const SUFFIXES = [
  { value: 1e18, symbol: 'Qi' },
  { value: 1e15, symbol: 'Q' },
  { value: 1e12, symbol: 'T' },
  { value: 1e9,  symbol: 'B' },
  { value: 1e6,  symbol: 'M' },
  { value: 1e3,  symbol: 'K' },
];

export function formatLargeNumber(num, decimals = 1) {
  if (num === 0) return '0';
  const abs = Math.abs(num);
  for (const { value, symbol } of SUFFIXES) {
    if (abs >= value) {
      return (num / value).toFixed(decimals) + ' ' + symbol;
    }
  }
  return num.toFixed(decimals);
}

export function formatScientific(num, sigFigs = 3) {
  if (num === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(num)));
  const mantissa = num / Math.pow(10, exp);
  return `${mantissa.toFixed(sigFigs - 1)}×10^${exp}`;
}

export function formatTemperature(kelvin) {
  if (kelvin >= 1e9) return formatLargeNumber(kelvin, 1);
  if (kelvin >= 1000) return (kelvin / 1000).toFixed(2) + 'K K';
  return kelvin.toFixed(kelvin < 10 ? 2 : 1) + ' K';
}

export function formatPercent(fraction, decimals = 1) {
  return (fraction * 100).toFixed(decimals) + '%';
}

export function formatTimeBYA(bya) {
  if (bya < 0.001) return '< 1 MYA';
  if (bya < 1) return (bya * 1000).toFixed(0) + ' MYA';
  return bya.toFixed(2) + ' BYA';
}

export function formatCompact(num) {
  if (num >= 1e15) return (num / 1e15).toFixed(1) + ' Q';
  if (num >= 1e12) return (num / 1e12).toFixed(1) + ' T';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + ' B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + ' M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + ' K';
  return num.toFixed(0);
}
