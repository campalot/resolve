export type DemoSession = {
  sessionId: string;
  userId: string;
};

export type GraphQLContext = {
  sessionContext: {
    sessionId: string;
    currentWorkspaceId?: string;
  };
}