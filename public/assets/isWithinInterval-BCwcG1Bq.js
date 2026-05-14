import { b3 as toDate } from "./index-C4ZP3eFM.js";
function isWithinInterval(date, interval) {
  const time = +toDate(date);
  const [startTime, endTime] = [
    +toDate(interval.start),
    +toDate(interval.end)
  ].sort((a, b) => a - b);
  return time >= startTime && time <= endTime;
}
export {
  isWithinInterval as i
};
