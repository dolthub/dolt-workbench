import { gql } from "@apollo/client";

export const ADD_REMOTE = gql`
  mutation AddRemote(
    name:String!
    $databaseName: String!
    $remoteName: String!
    $remoteUrl: String!
  ) {
    addRemote(
      name:$name 
      databaseName: $databaseName
      remoteName: $remoteName
      remoteUrl: $remoteUrl
    )
  }
`;
