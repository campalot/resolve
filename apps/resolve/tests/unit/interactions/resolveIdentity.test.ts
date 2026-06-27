import { resolveIdentity } from "../../../src/api/mocks/common/resolvers";
import { getMockDb } from "../../../src/mocks/mockDB";
import type { InteractionActivityMetadataRecord_Reviewer } from "../../../src/types/api";

describe('resolveIdentity', () => {
  const db = getMockDb();

  const mockDb = {
    ...db,
    identities: db.identities.map((identity, index) => {
      if (index === 0) return { ...identity, id: 'company-1' };
      if (index === 1) return { ...identity, id: 'person-1', workspaceId: 'alpha', companyId: 'company-1' };
      return identity;
    }),
    interactions: db.interactions.map((interaction, index) => {
      if (index === 0) return { 
        ...interaction, 
        id: 'int-1',
        status: 'APPROVED',
        parties: [
          { role: 'SELLER', identityId: 'person-1' },
          { role: 'BUYER', identityId: 'person-2' },
        ], 
      };
      if (index === 1) return { ...interaction, status: 'IN_REVIEW', currentReviewerId: 'person-1' };
      return interaction;
    }),
    interactionActivities: db.interactionActivities.map((activity, index) => {
      if (index === 0) return { 
        ...activity, 
        workspaceId: 'alpha',
        interactionId: 'int-1', 
        metadata: {
          __typename: 'InteractionActivityMetadataRecord_Reviewer' as const,
          nextReviewer: {
            ...(activity.metadata as InteractionActivityMetadataRecord_Reviewer).nextReviewer,
            identityId: 'person-1',
          },
        },
      };
      if (index === 1) return { 
        ...activity, 
        workspaceId: 'alpha',
        interactionId: 'int-1',
        actorId: 'person-1', 
      };
      return activity;
    }),
  };

  const baseIdentity = {
    ...mockDb.identities[1],
    id: 'person-1',
  };

  const resolve = (identityOverride = {}) =>
    resolveIdentity(
      { ...baseIdentity, ...identityOverride },
      { role: 'Admin', db: mockDb }
    );

  it('hydrates company correctly', () => {
    const result = resolve();
    expect(result.company?.id).toBe('company-1');
  });

  it('computes users total interactions correctly', () => {
    const result = resolve();
    expect(result.stats.total).toEqual(2);
  });

  it('computes users interactions awaiting action correctly', () => {
    const result = resolve();
    expect(result.stats.awaiting).toEqual(1);
  });

  it('computes users active interactions correctly', () => {
    const result = resolve();
    expect(result.stats.active).toEqual(1);
  });

  it('handles null company gracefully', () => {
    const identity = {
      ...baseIdentity,
      companyId: null,
    };

    const result = resolve(identity);
    expect(result.company).toBeUndefined();
  });
});
