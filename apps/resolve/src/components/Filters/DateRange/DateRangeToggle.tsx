import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import EventIcon from "@mui/icons-material/Event";
import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { Dayjs } from "dayjs";
import { DateRangePickerContent } from "./DateRangePickerContent";
import styles from "./DateRangeToggle.module.scss";

type Props = {
  start: Dayjs | null;
  end: Dayjs | null;
  onChange: (start: Dayjs | null, end: Dayjs | null) => void;
};

export const DateRangeToggle: React.FC<Props> = ({ start, end, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const formatShort = (date: Dayjs | null) =>
    date ? date.format("MMM D") : "";

  const hasValue = Boolean(start || end);

  return (
    <>
      <Box
        component="fieldset"
        className={`${styles.muiFieldset} ${open ? styles.open : ""}`}
      >
        <legend className={hasValue || open ? styles.active : ""}>
          Date Range
        </legend>

        <IconButton
          aria-label="Open date range picker"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={handleOpen}
          color={hasValue ? "primary" : "default"}
          className={hasValue ? styles.hasValue : styles.defaultValue}
        >
          {hasValue ? (
            <Typography variant="body2">
              {formatShort(start)} – {formatShort(end)}
            </Typography>
          ) : (
            <>
              <EventIcon className={styles.calendar} />
              <Typography
                variant="body1"
                className={`${styles.defaultLabel} ${open ? styles.open : ""}`}
              >
                Date Range
              </Typography>
            </>
          )}
        </IconButton>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box p={2}>
          <DateRangePickerContent
            start={start}
            end={end}
            onApply={(s, e) => {
              onChange(s, e);
              handleClose();
            }}
            onCancel={handleClose}
          />
        </Box>
      </Popover>
    </>
  );
};
