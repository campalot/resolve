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
import { PageHeader } from "../components/PageHeader/PageHeader";
import PageContainer from "../components/PageContainer/PageContainer";
import { SummaryField } from "../fields/summaryField";
import { summarySchema } from "../fields/summaryField";
import NumberInput from "../components/NumberInput";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { FormDatePicker } from "../components/DatePicker";
import SubmissionSuccess from "../components/SubmissionSuccess/SubmissionSuccess";

// Define the Zod schema matching your PolicyUpdateData model
const proposalSchema = z.object({
  summary: summarySchema,
  amount: z
    .number({ error: "Amount is required and must be a number" })
    .positive({ message: "Amount must be greater than 0" }),
  currency: z.enum(["USD"], {
    error: "Please select a currency",
  }),
  effectiveDate: z
    .string({ message: "Effective date is required" })
    .min(1, { message: "Effective date is required" })
    .date({ message: "Invalid date format" }), // Ensures YYYY-MM-DD layout

  // Optional string. Allows undefined, null, or an empty string.
  expirationDate: z
    .string()
    .date({ message: "Invalid date format" })
    .optional()
    .or(z.literal("")),
  parties: partiesSchema,
});

// Infer TypeScript type from the Zod schema
export type ProposalFormData = z.input<typeof proposalSchema>;
export type ProposalFormOutput = z.infer<typeof proposalSchema>;

export default function PolicyUpdateForm() {

  const methods = useForm<ProposalFormData, undefined, ProposalFormOutput>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      summary: "Update to internal policy requirements.",
      amount: 0,
      currency: "USD",
      effectiveDate: "",
      expirationDate: "",
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

  const onSubmit = async (data: ProposalFormOutput) => {
    console.log("made it here");
    const { parties, ...remainingFormData } = data;
    const interactionPayload: CreateFormProps = {
      actorId: currentUser?.id ?? "", // Fallback to empty string if undefined
      workspaceId: workspace.id,
      parties: parties ?? [], // Fallback to empty array if undefined
      type: "PROPOSAL" as InteractionType,
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
            title="New Proposal"
            isSubmitting={isSubmitting}
            description="Let us help route your proposal to the right team."
            submitText="Create New Proposal"
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
            {/* Amount Field */}
            <Box sx={{ minWidth: 280, mb: 2 }}>
              <Controller
                name="amount"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <NumberInput
                      label="Amount ($)"
                      // min={0}
                      // max={40}
                      value={field.value}
                      onValueChange={field.onChange}
                      inputRef={field.ref}
                      onBlur={field.onBlur}
                      size="small"
                      smallStep={0.01}
                    />
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Box>

            {/* CurrencyField */}
            <Box sx={{ minWidth: 280, mb: 3 }}>
              <Controller
                name="currency"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel id="currency-label">Currency</InputLabel>
                    <Select
                      labelId="currency-label"
                      id="currency-select"
                      label="Currency"
                      size="small"
                      {...field} // Tracks value and handles updates automatically
                    >
                      <MenuItem value="USD">USD</MenuItem>
                    </Select>

                    {/* Displays the Zod error message under the dropdown */}
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              // Responsive layout rule:
              // Stack elements vertically on small screens (xs),
              // Arrange horizontally on tablet/desktop (sm and up)
              flexDirection: { xs: "column", sm: "row" },
              // justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "flex-start" },
              gap: { xs: 3, sm: 2 },
              mb: 2,
              pb: 0,
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            {/* Effective Date Field */}
            <Box sx={{ minWidth: 280, maxWidth: 300, mb: 2 }}>
              <FormDatePicker name="effectiveDate" label="Effective Date" />
            </Box>

            {/* Expiration Date Field (Optional) */}
            <Box sx={{ minWidth: 280, maxWidth: 300, mb: 2 }}>
              <FormDatePicker
                name="expirationDate"
                label="Expiration Date (Optional)"
              />
            </Box>
          </Box>

          {/* Parties Fields Section */}
          <PartiesSection parties={parties} />
        </form>
      </FormProvider>
    </PageContainer>
  );
}
