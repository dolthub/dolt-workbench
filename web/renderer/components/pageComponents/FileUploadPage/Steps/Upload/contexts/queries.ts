import { gql } from "@apollo/client";

export const LOAD_DATA = gql`
  mutation LoadData(
    $databaseName: String!
    $refName: String!
    $schemaName: String
    $tableName: String!
    $importOp: ImportOperation!
    $fileType: FileType!
    $file: Upload!
    $modifier: LoadDataModifier
  ) {
    loadDataFile(
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      tableName: $tableName
      importOp: $importOp
      fileType: $fileType
      file: $file
      modifier: $modifier
    )
  }
`;
