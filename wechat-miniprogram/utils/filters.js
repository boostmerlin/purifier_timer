function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function daysBetween(startMs, endMs) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((endMs - startMs) / msPerDay);
}

function computeFilterProgress(filter, now = Date.now()) {
  const usedDays = Math.max(0, daysBetween(filter.startedAt, now));
  const remaining = Math.max(0, filter.lifespanDays - usedDays);
  const progress = clamp01(remaining / Math.max(1, filter.lifespanDays));
  return { usedDays, remaining, progress };
}

function nextLetter(lettersInUse) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < letters.length; i += 1) {
    const letter = letters.charAt(i);
    if (lettersInUse.indexOf(letter) === -1) {
      return letter;
    }
  }
  throw new Error('已用尽 A-Z 标识');
}

module.exports = {
  clamp01,
  daysBetween,
  computeFilterProgress,
  nextLetter,
};
