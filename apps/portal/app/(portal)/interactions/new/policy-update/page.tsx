"use client";

import { useState } from "react";
import {
  useForm,
  Controller,
  FormProvider,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateInteraction } from "@/hooks/useCreateInteraction";
import { useReferenceData } from "@/hooks/useReferenceData";
import styles from "./page.module.css";
import { useCurrentUser } from "@/contexts/CurrentUser/CurrentUserContext";
import type {
  CreateFormProps,
  InteractionType,
  InteractionRecord,
} from "@resolve/types";
import { useWorkspace } from "@/contexts/Workspace/WorkspaceContext";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import { FormDatePicker } from "../components/DatePicker";
import { partiesSchema } from "../fields/partiesFields";
import { PartiesSection } from "../fields/partiesFields";
import { summarySchema } from "../fields/summaryField";
import { SummaryField } from "../fields/summaryField";
import { PageHeader } from "../components/PageHeader/PageHeader";
import PageContainer from "../components/PageContainer/PageContainer";
import SubmissionSuccess from "../components/SubmissionSuccess/SubmissionSuccess";

// Define the Zod schema matching your PolicyUpdateData model
const policySchema = z.object({
  summary: summarySchema,
  policyArea: z.enum(["Security", "Compliance", "HR"], {
    message: "Please select a policy area",
  }),
  effectiveDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  impactLevel: z.enum(["Low", "Medium", "High"], {
    message: "Please select an impact level",
  }),
  parties: partiesSchema,
});

// Infer TypeScript type from the Zod schema
export type PolicyUpdateData = z.infer<typeof policySchema>;

export default function PolicyUpdateForm() {
  const methods = useForm<PolicyUpdateData>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      summary: "Update to internal policy requirements.",
      policyArea: "Security",
      effectiveDate: new Date().toISOString().split("T")[0],
      impactLevel: "Low",
      // Initialize with two party objects ready to fill
      parties: [
        { identityId: "", role: "Partner" },
        { identityId: "", role: "Partner" },
      ],
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = methods;

  const workspace = useWorkspace();
  const { mutateAsync: createInteraction, isPending } = useCreateInteraction();
  const { parties, types } = useReferenceData();
  const { currentUser } = useCurrentUser();
  const [submittedInteraction, setSubmittedInteraction] =
    useState<InteractionRecord | null>(null);

  const onSubmit = async (data: PolicyUpdateData) => {
    const { parties, ...remainingFormData } = data;
    const interactionPayload: CreateFormProps = {
      actorId: currentUser?.id ?? "", // Fallback to empty string if undefined
      workspaceId: workspace.id,
      parties: parties ?? [], // Fallback to empty array if undefined
      type: "POLICY_UPDATE" as InteractionType,
      data: remainingFormData, // This holds only the unique form fields
    };
    try {
      const response = await createInteraction(interactionPayload);
      setSubmittedInteraction(response.newInteraction);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  if (submittedInteraction) {
    return <SubmissionSuccess interaction={submittedInteraction} />;
  }


  return (
    <PageContainer>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* Header Context Container */}
          <PageHeader
            title="New Policy Update"
            isSubmitting={isSubmitting}
            description="Let us help route your request to the right team."
            submitText="Create Policy Update"
          />

          <Box sx={{ minWidth: 320, mt: 6 }}>
            {/* Summary Field */}
            <SummaryField />

            <Box
              sx={{
                display: "flex",
                // Responsive layout rule:
                // Stack elements vertically on small screens (xs),
                // Arrange horizontally on tablet/desktop (sm and up)
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "flex-start" },
                gap: { xs: 3, sm: 2 },
                mb: 2,
                pb: 0,
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              {/* Policy Area Field */}
              <Box sx={{ minWidth: 320, mb: 2 }}>
                <Controller
                  name="policyArea"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel id="policy-area-label">
                        Policy Area
                      </InputLabel>
                      <Select
                        labelId="policy-area-label"
                        id="policy-area-select"
                        label="Policy Area"
                        size="small"
                        {...field} // Tracks value and handles updates automatically
                      >
                        <MenuItem value="Security">Security</MenuItem>
                        <MenuItem value="Compliance">Compliance</MenuItem>
                        <MenuItem value="HR">HR</MenuItem>
                      </Select>

                      {/* Displays the Zod error message under the dropdown */}
                      {error && (
                        <FormHelperText>{error.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Box>
              {/* Effective Date Field */}
              <Box sx={{ minWidth: 320, mb: 2 }}>
                <FormDatePicker name="effectiveDate" label="Effective Date" />
              </Box>
            </Box>
            {/* Impact Level Field */}
            <Box sx={{ minWidth: 320, mb: 2 }}>
              <Controller
                name="impactLevel"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <FormLabel id="impact-level-label">Impact Level</FormLabel>

                    <RadioGroup
                      row
                      aria-labelledby={`impact-level-label`}
                      {...field}
                    >
                      {["Low", "Medium", "High"].map((level) => (
                        <FormControlLabel
                          key={level}
                          value={level}
                          control={<Radio />}
                          label={level}
                        />
                      ))}
                    </RadioGroup>

                    {/* Displays the Zod error message under the dropdown */}
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Box>
            {/* Parties Fields Section */}
            <PartiesSection parties={parties} />
          </Box>
        </form>
      </FormProvider>
    </PageContainer>
  );
}
