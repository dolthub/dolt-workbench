export enum UploadStage {
  Branch = 1,
  Table = 2,
  Upload = 3,
}

export function getUploadStage(s?: string, isDolt?: boolean): UploadStage {
  switch (s) {
    case "branch":
      return UploadStage.Branch;
    case "table":
      return UploadStage.Table;
    case "upload":
      return UploadStage.Upload;
    default:
      return isDolt ? UploadStage.Branch : UploadStage.Table;
  }
}
