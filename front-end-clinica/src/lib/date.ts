import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("pt-br");

export const defaultTimezone = "America/Sao_Paulo";

export const formatDate = (date: string | Date, format = "DD/MM/YYYY") => {
  return dayjs(date).tz(defaultTimezone).format(format);
};

export const formatDateTime = (date: string | Date) => {
  return dayjs(date).tz(defaultTimezone).format("DD/MM/YYYY HH:mm");
};

export const formatTime = (date: string | Date) => {
  return dayjs(date).tz(defaultTimezone).format("HH:mm");
};

export { dayjs };
