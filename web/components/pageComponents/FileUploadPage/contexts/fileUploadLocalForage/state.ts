import { Route } from "@dolthub/web-utils";
import {
  FileType,
  ImportOperation,
  LoadDataModifier,
} from "@gen/graphql-types";
import { ErrorType } from "@lib/errors/types";
import { DatabaseParams } from "@lib/params";

const defaultState = {
  branchName: "",
  tableName: "",
  importOp: ImportOperation.Update,
  selectedFile: undefined as File | undefined, // file upload only
  fileType: FileType.Csv,
  modifier: undefined as LoadDataModifier | undefined,
  colNames: "",
};

export type FileUploadState = typeof defaultState;

export function getDefaultState(p: {
  tableName?: string;
  branchName?: string;
}): FileUploadState {
  return { ...defaultState, ...p };
}

export type FileUploadLocalForageContextType = {
  setState: (s: Partial<FileUploadState>) => void;
  setItem: <T>(k: keyof FileUploadState, v: T) => void;
  state: FileUploadState;
  initialLoad: boolean;
  updateLoad: boolean;
  error: ErrorType;
  clear: () => Promise<void>;
  dbParams: DatabaseParams;
  getUploadUrl: (s: string) => Route;
  isDolt: boolean;
};
