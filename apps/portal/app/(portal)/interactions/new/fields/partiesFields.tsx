import { z } from "zod";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Button,
} from "@mui/material";

// 1. Export the schema structures directly from this file
const partySchema = z.object({
  identityId: z.string().min(1, "Please select an identity"),
  role: z.enum(["Buyer", "Seller", "Partner"]),
});

export const partiesSchema = z
  .array(partySchema)
  .min(1, "At least one party is required");

type PartyOption = {
  id: string; 
  name: string;
}

// 2. Define the props type
interface PartiesSectionProps {
  parties: Array<PartyOption>;
}

// 3. Your component remains exactly the same
export function PartiesSection({ parties }: PartiesSectionProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "parties",
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        pt: 2,
        pb: 2,
        mb: 2,
        borderTop: "1px solid #e0e0e0",
        borderBottom: "1px solid #e0e0e0",
        width: "100%",
      }}
    >
      {/* Section Header */}
      <Typography
        variant="h6"
        sx={{ fontSize: "1rem", fontWeight: 600, color: "text.primary" }}
      >
        Involved Parties
      </Typography>

      {/* Global Array Error Message */}
      {errors.parties?.message && (
        <Typography
          variant="body2"
          sx={{ color: "error.main", fontWeight: 500 }}
        >
          {errors.parties.message as string}
        </Typography>
      )}

      {/* Loop through each party block */}
      {fields.map((field, index) => (
        <Box
          key={field.id}
          sx={{
            p: 2,
            border: "1px solid #e0e0e0",
            borderRadius: 1,
            backgroundColor: "#fafafa",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              mb: 2,
            }}
          >
            Party #{index + 1}
          </Typography>

          <Grid container spacing={2}>
            {/* 1. IDENTITY FIELD (MUI SELECT) */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`parties.${index}.identityId`} // Tracks individual index role
                control={control}
                render={({ field: controllerField, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error} size="small">
                    <InputLabel id={`party-identityId-label-${index}`}>
                      Identity ID
                    </InputLabel>
                    <Select
                      labelId={`party-identityId-label-${index}`}
                      id={`party-identityId-select-${index}`}
                      label="Identity ID"
                      {...controllerField}
                    >
                      {/* Placeholder option */}
                      <MenuItem value="">
                        <em>Select an identity</em>
                      </MenuItem>

                      {/* Render your data collection */}
                      {parties.map((party: PartyOption) => (
                        <MenuItem key={party.id} value={party.id}>
                          {party.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            {/* 2. ROLE FIELD (MUI SELECT) */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`parties.${index}.role`} // Tracks individual index role
                control={control}
                render={({ field: controllerField, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error} size="small">
                    <InputLabel id={`party-role-label-${index}`}>
                      Role
                    </InputLabel>
                    <Select
                      labelId={`party-role-label-${index}`}
                      id={`party-role-select-${index}`}
                      label="Role"
                      {...controllerField}
                    >
                      <MenuItem value="">
                        <em>Select a role</em>
                      </MenuItem>
                      <MenuItem value="Buyer">Buyer</MenuItem>
                      <MenuItem value="Seller">Seller</MenuItem>
                      <MenuItem value="Partner">Partner</MenuItem>
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </Box>
      ))}
    </Box>
  );
}
