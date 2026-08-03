"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/app/axiosInstance";
import styles from "./page.module.css";

// Define the Zod schema matching your PolicyUpdateData model
const policySchema = z.object({
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  policyArea: z.enum(["Security", "Compliance", "HR"], {
    required_error: "Please select a policy area",
  }),
  effectiveDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  impactLevel: z.enum(["Low", "Medium", "High"], {
    required_error: "Please select an impact level",
  }),
});

// Infer TypeScript type from the Zod schema
type PolicyUpdateData = z.infer<typeof policySchema>;

export default function PolicyUpdateForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PolicyUpdateData>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      summary: "Update to internal policy requirements.",
      policyArea: "Security",
      effectiveDate: new Date().toISOString().split("T")[0],
      impactLevel: "Low",
    },
  });

  const onSubmit = async (data: PolicyUpdateData) => {
    try {
      const response = await api.get(
        `/w/alpha/interactions/policy-update/new`,
        {
          params: data,
        },
      );
 
      return response.data;
    } catch (error) {
      console.error(error);
    }
    
  };


  return (
    <div className={styles.page}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        //className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg space-y-4"
        className={styles.main}
      >
        <h2 className="text-xl font-bold mb-4">Generate Policy Update</h2>

        {/* Summary Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Summary
          </label>
          <textarea
            {...register("summary")}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
          {errors.summary && (
            <p className="text-red-600 text-sm">{errors.summary.message}</p>
          )}
        </div>

        {/* Policy Area Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Policy Area
          </label>
          <select
            {...register("policyArea")}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="">Select an area</option>
            <option value="Security">Security</option>
            <option value="Compliance">Compliance</option>
            <option value="HR">HR</option>
          </select>
          {errors.policyArea && (
            <p className="text-red-600 text-sm">{errors.policyArea.message}</p>
          )}
        </div>

        {/* Effective Date Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Effective Date
          </label>
          <input
            type="date"
            {...register("effectiveDate")}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
          {errors.effectiveDate && (
            <p className="text-red-600 text-sm">
              {errors.effectiveDate.message}
            </p>
          )}
        </div>

        {/* Impact Level Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Impact Level
          </label>
          <div className="mt-2 space-x-4">
            {["Low", "Medium", "High"].map((level) => (
              <label
                key={level}
                className="inline-flex items-center text-gray-900"
              >
                <input
                  type="radio"
                  value={level}
                  {...register("impactLevel")}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <span className="ml-2">{level}</span>
              </label>
            ))}
          </div>
          {errors.impactLevel && (
            <p className="text-red-600 text-sm">{errors.impactLevel.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {isSubmitting ? "Generating..." : "Generate Policy Update"}
        </button>
      </form>
    </div>
  );
}
