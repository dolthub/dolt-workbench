import { createCustomContext } from "@dolthub/react-contexts";
import { useContextWithError } from "@dolthub/react-hooks";
import { ReactNode, useMemo, useState } from "react";

type ConflictsContextType = {
  activeTableName: string;
  setActiveTableName: (tableName: string) => void;
};

export const ConflictsContext =
  createCustomContext<ConflictsContextType>("ConflictsContext");

type Props = {
  children: ReactNode;
  tableName?: string;
};

export function ConflictsProvider(props: Props): JSX.Element {
  const [activeTableName, setActiveTableName] = useState(props.tableName ?? "");

  const value = useMemo(() => {
    return {
      activeTableName,
      setActiveTableName,
    };
  }, [activeTableName, setActiveTableName]);

  return (
    <ConflictsContext.Provider value={value}>
      {props.children}
    </ConflictsContext.Provider>
  );
}

export function useConflictsContext(): ConflictsContextType {
  return useContextWithError(ConflictsContext);
}
