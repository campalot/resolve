let currentAssetBaseUrl: string | null = null;

export const configureAssetBaseUrl = (assetBaseUrl: string): void => {
  currentAssetBaseUrl = assetBaseUrl;
};

export const getAssetBaseUrl = (): string => {
  if (!currentAssetBaseUrl) {
    throw new Error("Asset location not configured.");
  }

  return currentAssetBaseUrl;
};