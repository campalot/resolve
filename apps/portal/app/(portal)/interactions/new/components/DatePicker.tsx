import { useFormContext, Controller } from "react-hook-form";
import {
  FormControl,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

type FormDatePickerProps = {
  name: string;
  label: string;
}

export function FormDatePicker({ name, label }: FormDatePickerProps) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth error={!!error}>
          <DatePicker
            label={label}
            value={field.value ? dayjs(field.value) : null}
            onChange={(newValue) => {
              field.onChange(newValue ? newValue.format("YYYY-MM-DD") : "");
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                error: !!error,
                helperText: error?.message,
                onBlur: field.onBlur,
              },
            }}
          />
        </FormControl>
      )}
    />
  );
}
