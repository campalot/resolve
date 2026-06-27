import { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Box from "@mui/material/Box";
import Button from "../../Buttons/Button";
import { ButtonType } from "../../Buttons/Button";
import dayjs, { Dayjs } from "dayjs";

const presets = [
  {
    label: "Past 7 Days",
    getRange: () => ({
      start: dayjs().subtract(7, "day").startOf("day"),
      end: dayjs().endOf("day"),
    }),
  },
  {
    label: "Last 30 Days",
    getRange: () => ({
      start: dayjs().subtract(30, "day").startOf("day"),
      end: dayjs().endOf("day"),
    }),
  },
  {
    label: "This Month",
    getRange: () => ({
      start: dayjs().startOf("month"),
      end: dayjs().endOf("month"),
    }),
  },
];

type Props = {
  start: Dayjs | null;
  end: Dayjs | null;
  onApply: (start: Dayjs | null, end: Dayjs | null) => void;
  onCancel: () => void;
};

export const DateRangePickerContent: React.FC<Props> = ({
  start,
  end,
  onApply,
  onCancel,
}) => {
  const [localStart, setLocalStart] = useState<Dayjs | null>(start);
  const [localEnd, setLocalEnd] = useState<Dayjs | null>(end);

  const applyPreset = (getRange: () => { start: Dayjs; end: Dayjs }) => {
    const { start, end } = getRange();
    setLocalStart(start);
    setLocalEnd(end);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      role="group"
      aria-label="Date range"
    >
      {/* Presets */}
      <Box display="flex" gap={1} mb={2}>
        {presets.map(({ label, getRange }) => (
          <Button
            key={label}
            buttonType={ButtonType.Text}
            size="small"
            onClick={() => applyPreset(getRange)}
          >
            {label}
          </Button>
        ))}
      </Box>

      <DatePicker
        label="Start"
        value={localStart}
        onChange={(d) => setLocalStart(d)}
        slotProps={{ textField: { size: "small" } }}
      />

      <DatePicker
        label="End"
        minDate={localStart ?? undefined}
        value={localEnd}
        onChange={(d) => setLocalEnd(d)}
        slotProps={{ textField: { size: "small" } }}
      />

      <Box display="flex" justifyContent="space-between">
        <Button buttonType={ButtonType.Text} onClick={onCancel}>
          Cancel
        </Button>
        <Button
          buttonType={ButtonType.Primary}
          onClick={() => onApply(localStart, localEnd)}
        >
          Apply
        </Button>
      </Box>
    </Box>
  );
};
