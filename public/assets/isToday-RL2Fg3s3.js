import { c as constructNow } from "./index-C4ZP3eFM.js";
import { a as startOfDay } from "./format-BDODTvac.js";
function isSameDay(dateLeft, dateRight) {
  const dateLeftStartOfDay = startOfDay(dateLeft);
  const dateRightStartOfDay = startOfDay(dateRight);
  return +dateLeftStartOfDay === +dateRightStartOfDay;
}
function isToday(date) {
  return isSameDay(date, constructNow(date));
}
export {
  isToday as a,
  isSameDay as i
};
