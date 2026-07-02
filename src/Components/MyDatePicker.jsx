import  { useEffect, useState } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const MyDatePicker = ({
  format = "DD-MM-YYYY",
  value,
  setDateRange,
  size,
  disabledtheDate,
  startingDate,
}) => {
  const [searchDateRange] = useState(
    [startingDate ? dayjs() : dayjs().startOf("month"), dayjs()]
  );

  useEffect(() => {
    if (value) {
      setDateRange(value);
    } else if (value === "") {
      setDateRange(getDateFormatted([dayjs().startOf("month"), dayjs()]));
    } else {
      setDateRange(getDateFormatted([dayjs().startOf("month"), dayjs()]));
    }
  }, []);
  useEffect(() => {
    setTimeout(() => {
      if (value === "") {
        const formatted = getDateFormatted([
          dayjs().startOf("month"),
          dayjs(),
        ]);

        setDateRange(formatted);
      }
    }, 1000);
  });
  const date1 = dayjs("2024-03-31");
  const date2 = dayjs();
  let hours = date2.diff(date1, "hours");
  const days = Math.floor(hours / 24);
  hours = hours - days * 24;


  const disabledR35MinDate = (current) =>
    current && current < dayjs().subtract(days, "d");

  const disabledFutureDate = (current) =>
    current && current.isAfter(dayjs(), "day");

  const disabledDate = (current) => {
    if (disabledFutureDate(current)) return true;
    if (disabledtheDate == "true" && disabledR35MinDate(current)) return true;
    return false;
  };

  return (
    <DatePicker.RangePicker
      defaultValue={searchDateRange}
      size={size ? size : "default"}
      style={{
        width: "100%",
        fontSize: window.innerWidth <= 1600 ? "0.7rem" : "0.9rem",
      }}
      value={
        value !== ""
          ? getDateFormatted(value)
          : [dayjs().startOf("month"), dayjs()]
      }
      format={format}
      disabledDate={disabledDate}
      onChange={(e) => {
        setDateRange(getDateFormatted(e));
      }}
      presets={[
        { label: "Today", value: [dayjs(), dayjs()] },
        { label: "Yesterday", value: [dayjs().subtract(1, "day"), dayjs().subtract(1, "day")] },
        { label: "Last 7 Days", value: [dayjs().subtract(7, "d"), dayjs().subtract(1, "d")] },
        { label: "This Month", value: [dayjs().startOf("month"), dayjs()] },
        {
          label: "Last Month",
          value: [
            dayjs().startOf("month").subtract(1, "month"),
            dayjs().startOf("month").subtract(1, "d"),
          ],
        },
        { label: "Last 90 Days", value: [dayjs().subtract(89, "d"), dayjs()] },
      ]}
    />
  );
};

export default MyDatePicker;

const getDateFormatted = (value) => {
  if (typeof value === "string") {
    if (value.length > 0) {
      return [
        dayjs(value.substring(0, 10), "DD-MM-YYYY"),
        dayjs(value.substring(11, 21), "DD-MM-YYYY"),
      ];
    } else {
      return [dayjs().startOf("month"), dayjs()];
    }
  }
  if (typeof value === "object" && value?.length) {
    return `${dayjs(value[0]).format("DD-MM-YYYY")}-${dayjs(value[1]).format(
      "DD-MM-YYYY"
    )}`;
  }
};
