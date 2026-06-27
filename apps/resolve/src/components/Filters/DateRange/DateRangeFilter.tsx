import dayjs, { Dayjs } from "dayjs";
import { useDateRangeFilter } from "../../../hooks/useDateRangeFilter";
import { DateRangeToggle } from "./DateRangeToggle";

export const DateRangeFilter = () => {
  const { startDate, endDate, setValue } = useDateRangeFilter();

  // Convert URL ISO strings → Dayjs for UI only
  const start = startDate ? dayjs(startDate) : null;
  const end = endDate ? dayjs(endDate) : null;

  const handleChange = (newStart: Dayjs | null, newEnd: Dayjs | null) => {
    setValue(
      newStart ? newStart.format("YYYY-MM-DD") : "",
      newEnd ? newEnd.format("YYYY-MM-DD") : "",
    );
  };

  return <DateRangeToggle start={start} end={end} onChange={handleChange} />;
};
