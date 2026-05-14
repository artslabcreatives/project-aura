import { s as startOfWeek } from "./format-BDODTvac.js";
import { c as constructNow } from "./index-C4ZP3eFM.js";
import { i as isSameMonth } from "./isSameMonth-fupOC6M2.js";
function isSameWeek(dateLeft, dateRight, options) {
  const dateLeftStartOfWeek = startOfWeek(dateLeft, options);
  const dateRightStartOfWeek = startOfWeek(dateRight, options);
  return +dateLeftStartOfWeek === +dateRightStartOfWeek;
}
function isThisMonth(date) {
  return isSameMonth(date, constructNow(date));
}
export {
  isSameWeek as a,
  isThisMonth as i
};
