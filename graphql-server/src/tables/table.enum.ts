import { registerEnumType } from "@nestjs/graphql";

export enum ImportOperation {
  // Create,
  // Overwrite,
  Update,
  // Replace,
}

registerEnumType(ImportOperation, { name: "ImportOperation" });

export enum FileType {
  Csv,
  Psv,
  // Xlsx,
  // Json,
  // Sql,
  // Any,
}

registerEnumType(FileType, { name: "FileType" });

export enum LoadDataModifier {
  Ignore,
  Replace,
}

registerEnumType(LoadDataModifier, { name: "LoadDataModifier" });
