import type { IdentityRecord } from "../types/api";
import type { InteractionRecord } from "../types/api";
import type { InteractionDataRecord } from "../types/schema";
import type { VendorOnboardingData } from "../types/schema";
import type { PolicyUpdateData } from "../types/schema";
import type { ContractData } from "../types/schema";
import type { ProposalData } from "../types/schema";
import type { InteractionType } from "../types/schema";
import { interactionStateValues } from "../types/schema";
import { interactionRoleValues } from "../types/schema";
import { pickOne } from "../helpers";


function randomId() {
  return Math.random().toString(36).substring(2, 10);
}

function randomStatus() {
  const statuses: InteractionRecord["status"][] = interactionStateValues;
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function randomCounterparties(identities: IdentityRecord[]) {
  const identity1 =
    identities[Math.floor(Math.random() * identities.length)];

  let identity2;
  do {
    identity2 =
      identities[Math.floor(Math.random() * identities.length)];
  } while (identity2.id === identity1.id);

  const identity1role =
    interactionRoleValues[Math.floor(Math.random() * interactionRoleValues.length)];

  const identity2role =
    identity1role === "Buyer"
      ? "Seller"
      : identity1role === "Seller"
      ? "Buyer"
      : "Partner";

  return [
    { identityId: identity1.id, role: identity1role },
    { identityId: identity2.id, role: identity2role },
  ];
}

function getRandomInteger(min: number, max: number) {
  // Use Math.ceil() on min to ensure the minimum is inclusive even if it's a float
  min = Math.ceil(min);
  // Use Math.floor() on max to ensure the maximum is inclusive even if it's a float
  max = Math.floor(max);
  // The expression scales Math.random()'s output to the desired range
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFutureDateString(daysToAdd: number, startDate = new Date()) {
    const futureDate = new Date(startDate);
    
    // Use setDate to automatically handle month/year rollovers
    futureDate.setDate(futureDate.getDate() + daysToAdd);

    // Format the date to a consistent 'YYYY-MM-DD' string (UTC)
    // Using toISOString() in UTC avoids local timezone issues
    const dateString = futureDate.toISOString().split('T')[0];
    
    return dateString;
}
function pickInteractionType(): InteractionType {
  return pickOne([
    "PROPOSAL",
    "CONTRACT",
    "POLICY_UPDATE",
    "VENDOR_ONBOARDING",
  ]);
}
function generateProposalData(): ProposalData {
  const amount = getRandomInteger(5000, 250000);
  const daysTilEffective = getRandomInteger(1, 90);
  const proposedLength = (getRandomInteger(3, 12)) * 30;
  const effectiveDate = generateFutureDateString(daysTilEffective);
  const expirationDate = generateFutureDateString(proposedLength, new Date(effectiveDate))
  return {
    summary: "Proposal to update pricing and service scope.",
    amount,
    currency: "USD",
    effectiveDate,
    expirationDate,
  };
}
function generateContractData(): ContractData {
  return {
    summary: "Contract agreement outlining services and obligations.",
    contractValue: getRandomInteger(10000, 500000),
    termLengthMonths: pickOne([12, 24, 36]),
    autoRenew: Math.random() > 0.5,
  };
}
function generatePolicyUpdateData(): PolicyUpdateData {
  const daysTilEffective = getRandomInteger(1, 90);
  return {
    summary: "Update to internal policy requirements.",
    policyArea: pickOne(["Security", "Compliance", "HR"]),
    effectiveDate: generateFutureDateString(daysTilEffective),
    impactLevel: pickOne(["Low", "Medium", "High"]),
  };
}
function generateVendorOnboardingData(): VendorOnboardingData {
  return {
    summary: "New vendor onboarding process review.",
    vendorType: pickOne(["Logistics", "Software", "Consulting"]),
    riskLevel: pickOne(["Low", "Medium", "High"]),
    onboardingChecklistComplete: Math.random() > 0.5,
  };
}
function generateInteractionData(type: InteractionType): InteractionDataRecord {
  switch (type) {
    case "PROPOSAL":
      return generateProposalData();
    case "CONTRACT":
      return generateContractData();
    case "POLICY_UPDATE":
      return generatePolicyUpdateData();
    case "VENDOR_ONBOARDING":
      return generateVendorOnboardingData();
  }
}
function generateInteractionTitle(
  type: InteractionType,
  data: InteractionDataRecord
): string {
  switch (type) {
    case "PROPOSAL":
      return `Proposal – $${(data as ProposalData).amount.toLocaleString()}`;

    case "CONTRACT":
      return `Contract – ${(data as ContractData).termLengthMonths} Month Term`;

    case "POLICY_UPDATE":
      return `Policy Update – ${(data as PolicyUpdateData).policyArea}`;

    case "VENDOR_ONBOARDING":
      return `Vendor Onboarding – ${(data as VendorOnboardingData).vendorType}`;
  }
}




export function generateInteractions(workspaceId: string, identities: IdentityRecord[]) {
  const randomLength = Math.floor(Math.random() * (200 - 175 + 1)) + 175;
  return Array.from({ length: randomLength }).map(() => {
    const randomDate = new Date(
      Date.now() - Math.floor(Math.random() * 10000000000)
    ).toLocaleString();
    const randomCreateDate = new Date(
      new Date(randomDate).getTime() - Math.floor(Math.random() * 10000000000)
    ).toLocaleString();
    const counterParties = randomCounterparties(identities);
    const status = randomStatus();
    const currentReviewer = pickOne(identities);
    const type = pickInteractionType();
    const data = generateInteractionData(type);
    const title = generateInteractionTitle(type, data);

    return ({
      id: workspaceId + "_" + randomId(),
      workspaceId,
      title: title,
      type,
      data,
      parties: counterParties,
      status,
      updatedAt: randomDate,
      createdAt: randomCreateDate,
      creatorId: pickOne(counterParties).identityId,
      ...(status === "IN_REVIEW" && { currentReviewerId: currentReviewer.id }),
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    })
});
}
