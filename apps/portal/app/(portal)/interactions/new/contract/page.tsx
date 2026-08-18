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
import { summarySchema } from "../fields/summaryField";
import { 
  Box, 
  FormControl, 
  FormHelperText, 
  FormLabel, 
  RadioGroup, 
  Radio, 
  FormControlLabel 
} from "@mui/material";
import NumberInput from "../components/NumberInput";
import SubmissionSuccess from "../components/SubmissionSuccess/SubmissionSuccess";

// Define the Zod schema matching your PolicyUpdateData model
const contractSchema = z.object({
  summary: summarySchema,
  contractValue: z.coerce
    .number({
      message: "Contract value is required and must be a number",
    })
    .positive({ message: "Contract value must be greater than 0" }),
  termLengthMonths: z.coerce
    .number({
      message: "Term length is required and must be a number",
    })
    .positive({ message: "Term length must be greater than 0" }),
  autoRenew: z
    .union([z.boolean(), z.literal("true"), z.literal("false")])
    .transform((value) => value === true || value === "true")
    .pipe(
      z.boolean({
        message: "Auto renew is required and must be a boolean",
      }),
    ),
  parties: partiesSchema,
});

// Infer TypeScript type from the Zod schema
export type ContractFormData = z.infer<typeof contractSchema>;

export default function ContractForm() {

  const methods = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema) as any,
    defaultValues: {
      summary: "Update to internal policy requirements.",
      contractValue: 0,
      termLengthMonths: 0,
      autoRenew: true,
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

  const onSubmit = async (data: ContractFormData) => {
    const { parties, ...remainingFormData } = data;
    const interactionPayload: CreateFormProps = {
      actorId: currentUser?.id ?? "", // Fallback to empty string if undefined
      workspaceId: workspace.id,
      parties: parties ?? [], // Fallback to empty array if undefined
      type: "CONTRACT" as InteractionType,
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
            title="Create New Contract"
            isSubmitting={isSubmitting}
            description="Let us help route your request to the right team."
            submitText="Create New Contract"
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
            {/* Contract Value Field */}
            <Box sx={{ minWidth: 280, mb: 2 }}>
              <Controller
                name="contractValue"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <NumberInput
                      label="Contract Value ($)"
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

            {/* Term Length Field */}
            <Box sx={{ minWidth: 280, mb: 2 }}>
              <Controller
                name="termLengthMonths"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <NumberInput
                      label="Term Length (Months)"
                      // min={0}
                      // max={40}
                      value={field.value}
                      onValueChange={field.onChange}
                      inputRef={field.ref}
                      onBlur={field.onBlur}
                      size="small"
                    />
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Box>
          </Box>

          {/* Auto Renew Field */}
          <Box sx={{ minWidth: 320, mb: 2 }}>
            <Controller
              name="autoRenew"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error}>
                  <FormLabel id="auto-renew-label">Auto Renew</FormLabel>

                  <RadioGroup
                    row
                    aria-labelledby={`auto-renew-label`}
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
