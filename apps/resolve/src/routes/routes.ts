export const Route = {
  Home: `dashboard`,
  Interactions: `interactions`,
  InteractionDetail: `interactions/:interactionId/:tabId?`,
  People: `people`,
  IdentityDetail: `identities/:identityId`,
  MobileSearch: `search`,
};


export function interactionRoute(
  interactionId: string,
  tabId?: string,
): string {
  return `interactions/${interactionId}${tabId ? "/" + tabId : ""}`;
}

export function identityRoute(
  identityId: string,
): string {
  return `identities/${identityId}`;
}