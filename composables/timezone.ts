import moment from "moment-timezone";

export const useTimezone = () => {
  const convertToRiyadhTime = (utcDateTime: string) => {
    return moment
      .utc(utcDateTime)
      .tz("Asia/Riyadh")
      .format("YYYY-MM-DD hh:mm:ss A");
  };
  return {
    convertToRiyadhTime,
  };
};
