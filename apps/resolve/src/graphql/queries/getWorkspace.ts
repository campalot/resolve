import { gql } from "@apollo/client";

export const GET_WORKSPACE = gql`
  query GetWorkspace($workspaceId: String!) {
    workspace(workspaceId: $workspaceId) {
      id
      name
      __typename
    }
  }
`;
