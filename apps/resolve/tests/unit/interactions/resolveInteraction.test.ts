import { getPermittedActions } from "../../../src/api/mocks/common/resolvers";
import { resolveInteraction } from "../../../src/api/mocks/common/resolvers";
import { getMockDb } from "../../../src/mocks/mockDB";

describe('resolveInteraction', () => {
  const db = getMockDb();

  const mockDb = {
    ...db,
    identities: db.identities.map((identity, index) => {
      if (index === 0) return { ...identity, id: 'user-1' };
      if (index === 1) return { ...identity, id: 'user-2' };
      return identity;
    }),
  };

  const baseInteraction = {
    ...mockDb.interactions[0],
    id: 'int-1',
    status: 'DRAFT',
    creatorId: 'user-1',
    currentReviewerId: 'user-2',
    parties: [
      { role: 'SELLER', identityId: 'user-1' },
      { role: 'BUYER', identityId: 'user-2' },
    ],
  };

  const resolve = (interactionOverride = {}) =>
    resolveInteraction(
      { ...baseInteraction, ...interactionOverride },
      { role: 'Admin', db: mockDb }
    );

  it('hydrates creator and reviewer correctly', () => {
    const result = resolve();

    expect(result.creator.id).toBe('user-1');
    expect(result.currentReviewer?.id).toBe('user-2');
  });

  it('computes permittedActions correctly', () => {
    const result = resolve();

    const expected = getPermittedActions('DRAFT', 'Admin');

    expect(result.permittedActions).toEqual(expected);
  });

  it('maps parties with identities', () => {
    const result = resolve();

    expect(result.parties).toHaveLength(2);
    expect(result.parties[0].identity.id).toBe('user-1');
  });

  it('filters out missing identities in parties', () => {
    const interactionWithBadParty = {
      ...baseInteraction,
      parties: [
        { role: 'SELLER', identityId: 'missing-id' },
      ],
    };

    const result = resolve(interactionWithBadParty);

    expect(result.parties).toHaveLength(0);
  });

  it('handles null currentReviewer gracefully', () => {
    const interaction = {
      ...baseInteraction,
      currentReviewerId: null,
    };

    const result = resolve(interaction);

    expect(result.currentReviewer).toBeNull();
  });
});
