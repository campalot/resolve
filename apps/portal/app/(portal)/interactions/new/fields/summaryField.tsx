import { z } from "zod";
import { useFormContext, Controller } from "react-hook-form";
import {
  Box,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";

export const summarySchema = z.string().min(10, "Summary must be at least 10 characters");

export function SummaryField() {
  const { control } = useFormContext();
  return (
    <Box sx={{ minWidth: 320, mb: 3 }}>
      <Controller
        name={`summary`} // Tracks individual index role
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl fullWidth error={!!error} size="small">
            
            <TextField
              id="standard-multiline-static"
              label="Summary"
              multiline
              rows={4}
              {...field}
            />
            {error && <FormHelperText>{error.message}</FormHelperText>}
          </FormControl>
        )}
      />
    </Box>
  );
}
