"use client";

import { useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
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
import { partiesSchema } from "../fields/partiesFields";
import { PartiesSection } from "../fields/partiesFields";
import PageContainer from "../components/PageContainer/PageContainer";
import { PageHeader } from "../components/PageHeader/PageHeader";
import { SummaryField } from "../fields/summaryField";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup
} from "@mui/material";
import SubmissionSuccess from "../components/SubmissionSuccess/SubmissionSuccess";

// Define the Zod schema matching your PolicyUpdateData model
const vendorOnboardingSchema = z.object({
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  vendorType: z.enum(["Logistics", "Software", "Consulting"], {
    error: "Please select a vendor type",
  }),
  riskLevel: z.enum(["Low", "Medium", "High"], {
    error: "Please select a risk level",
  }),
  onboardingChecklistComplete: z
    .union([z.boolean(), z.literal("true"), z.literal("false")])
    .transform((value) => value === true || value === "true")
    .pipe(
      z.boolean({
        message:
          "Onboarding checklist complete is required and must be a boolean",
      }),
    ),
  parties: partiesSchema,
});

// Infer TypeScript type from the Zod schema
export type VendorOnboardingData = z.input<typeof vendorOnboardingSchema>;
export type VendorOnboardingOutput = z.infer<typeof vendorOnboardingSchema>;

export default function PolicyUpdateForm() {

  const methods = useForm<
    VendorOnboardingData,
    undefined,
    VendorOnboardingOutput
  >({
    resolver: zodResolver(vendorOnboardingSchema),
    defaultValues: {
      summary: "Update to internal policy requirements.",
      vendorType: "Software",
      onboardingChecklistComplete: true,
      riskLevel: "Low",
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

  const onSubmit = async (data: VendorOnboardingOutput) => {
    const { parties, ...remainingFormData } = data;
    const interactionPayload: CreateFormProps = {
      actorId: currentUser?.id ?? "", // Fallback to empty string if undefined
      workspaceId: workspace.id,
      parties: parties ?? [], // Fallback to empty array if undefined
      type: "VENDOR_ONBOARDING" as InteractionType,
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          //className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg space-y-4"
          //className={styles.main}
        >
          {/* Header Context Container */}
          <PageHeader
            title="New Vendor Onboarding Request"
            isSubmitting={isSubmitting}
            description="Let us help route your onboarding request to the right team."
            submitText="Create Request"
          />

          {/* Summary Field */}
          <SummaryField />

          <Box
            sx={{
              display: "flex",
              // Responsive layout rule:
              // Stack elements vertically on small screens (xs),
              // Arrange horizontally on tablet/desktop (sm and up)
              flexDirection: { xs: "column", sm: "row" },
              //justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "flex-start" },
              gap: { xs: 3, sm: 2 },
              mb: 2,
              pb: 0,
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            {/* Vendor Type Field */}
            <Box sx={{ minWidth: 320, mb: 2, mr: 2 }}>
              <Controller
                name="vendorType"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel id="vendor-type-label">Vendor Type</InputLabel>
                    <Select
                      labelId="vendor-type-label"
                      id="vendor-type-select"
                      label="Vendor Type"
                      {...field} // Tracks value and handles updates automatically
                    >
                      <MenuItem value="Logistics">Logistics</MenuItem>
                      <MenuItem value="Software">Software</MenuItem>
                      <MenuItem value="Consulting">Consulting</MenuItem>
                    </Select>

                    {/* Displays the Zod error message under the dropdown */}
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Box>

            {/* Risk Level Field */}
            <Box sx={{ minWidth: 320, mb: 2 }}>
              <Controller
                name="riskLevel"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <FormLabel id="risk-level-label">Risk Level</FormLabel>

                    <RadioGroup
                      row
                      aria-labelledby={`risk-level-label`}
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
          </Box>

          {/* Onboarding Checklist Complete Field */}
          <Box sx={{ minWidth: 320, mb: 2 }}>
            <Controller
              name="onboardingChecklistComplete"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error}>
                  <FormLabel id="onboarding-checklist-complete-label">
                    Onboarding Checklist Complete?
                  </FormLabel>

                  <RadioGroup
                    row
                    aria-labelledby={`onboarding-checklist-complete-label`}
                    {...field}
                  >
                    {["true", "false"].map((level) => (
                      <FormControlLabel
                        key={level}
                        value={level}
                        control={<Radio />}
                        label={level === "true" ? "Yes" : "No"}
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
        </form>
      </FormProvider>
    </PageContainer>
  );
}
