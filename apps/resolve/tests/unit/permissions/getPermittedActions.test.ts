import { getPermittedActions } from "../../../src/api/mocks/common/resolvers";

describe('getPermittedActions', () => {
  it('returns correct actions for ADMIN in DRAFT state', () => {
    const result = getPermittedActions('DRAFT', 'Admin');

    expect(result).toEqual(['SUBMIT']); 
  });

  it('filters actions correctly for Viewer role', () => {
    const result = getPermittedActions('DRAFT', 'Viewer');

    expect(result).toEqual([]); 
  });

  it('returns empty array for unknown status', () => {
    const result = getPermittedActions('UNKNOWN', 'Admin');

    expect(result).toEqual([]);
  });
});
