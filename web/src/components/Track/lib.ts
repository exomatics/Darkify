export function formatDuration(duration: string) {
  const [time, ms] = duration.split(".");
  let parts = time.split(":").map(Number);

  // [hours, minutes, seconds]
  while (parts.length < 3) parts.unshift(0);

  const [hours, minutes, seconds] = parts;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  } else {
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }
}
