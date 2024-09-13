import { gql } from "@apollo/client";

export const DIFF_STAT = gql`
  fragment DiffStatForDiffs on DiffStat {
    rowsUnmodified
    rowsAdded
    rowsDeleted
    rowsModified
    cellsModified
    rowCount
    cellCount
  }
  query DiffStat(
    $databaseName: String!
    $fromRefName: String!
    $toRefName: String!
    $refName: String
    $type: CommitDiffType
    $tableName: String
  ) {
    diffStat(
      databaseName: $databaseName
      fromRefName: $fromRefName
      toRefName: $toRefName
      refName: $refName
      type: $type
      tableName: $tableName
    ) {
      ...DiffStatForDiffs
    }
  }
`;
