import { ApolloErrorType } from "@lib/errors/types";
import { DatabaseParams, OptionalRefParams } from "@lib/params";
import { Dispatch, ReactNode } from "react";

type ModalState = {
  errorIsOpen: boolean;
};

export type ExecuteProps = OptionalRefParams & {
  query: string;
  expandedSection?: string;
  schemaName?: string;
};

export type SqlEditorContextType = {
  editorString: string;
  setEditorString: (s: string) => void;
  showSqlEditor: boolean;
  toggleSqlEditor: (s?: boolean) => void;
  executeQuery: (p: ExecuteProps) => Promise<void>;
  queryClickHandler: (p: ExecuteProps) => Promise<void>;
  error?: ApolloErrorType;
  setError: (e: ApolloErrorType) => void;
  loading: boolean;
  modalState: ModalState;
  setModalState: Dispatch<Partial<ModalState>>;
};

export type Props = {
  children: ReactNode;
  params: DatabaseParams;
};
