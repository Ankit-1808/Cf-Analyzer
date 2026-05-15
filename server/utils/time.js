const MS_IN_HOUR = 60 * 60 * 1000;
const MS_IN_DAY = 24 * MS_IN_HOUR;

function pad(number) {
  return String(number).padStart(2, "0");
}

function getUtcDateKey(input) {
  const date = new Date(input);
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate())
  ].join("-");
}

function startOfUtcDay(input = new Date()) {
  const date = new Date(input);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addHours(input, hours) {
  return new Date(new Date(input).getTime() + hours * MS_IN_HOUR);
}

function addDays(input, days) {
  return new Date(new Date(input).getTime() + days * MS_IN_DAY);
}

function daysBetweenInclusive(start, end) {
  const startDay = startOfUtcDay(start).getTime();
  const endDay = startOfUtcDay(end).getTime();
  return Math.max(1, Math.floor((endDay - startDay) / MS_IN_DAY) + 1);
}

function roundTo(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}

function getTimeOfDayLabel(hour) {
  if (hour < 6) {
    return "Night (00:00-05:59 UTC)";
  }

  if (hour < 12) {
    return "Morning (06:00-11:59 UTC)";
  }

  if (hour < 18) {
    return "Afternoon (12:00-17:59 UTC)";
  }

  return "Evening (18:00-23:59 UTC)";
}

module.exports = {
  MS_IN_DAY,
  addDays,
  addHours,
  daysBetweenInclusive,
  getTimeOfDayLabel,
  getUtcDateKey,
  roundTo,
  startOfUtcDay
};
