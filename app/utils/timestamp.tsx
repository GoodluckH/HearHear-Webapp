import strftime from "strftime";
export function convertUNIXToString(unixTimestamp: string, format?: string) {
  const date_obj = new Date(Number(unixTimestamp));
  return strftime(format || "%B %d, %Y %I:%M %p", date_obj);
}
