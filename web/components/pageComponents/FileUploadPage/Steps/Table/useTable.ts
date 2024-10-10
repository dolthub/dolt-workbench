import { useSetState } from "@dolthub/react-hooks";
import { useRouter } from "next/router";
import { Dispatch, useEffect, useState } from "react";
import { useFileUploadContext } from "../../contexts/fileUploadLocalForage";

const defaultState = {
  existingTable: "",
  schemaName: undefined as string | undefined,
  err: "",
  valErr: "",
};

type TableState = typeof defaultState;
export type TableDispatch = Dispatch<Partial<TableState>>;

type ReturnType = {
  state: TableState;
  setState: TableDispatch;
  onNext: () => void;
  disabled: boolean;
};

export default function useTable(): ReturnType {
  const {
    state: { tableName, importOp, schemaName },
    setItem,
    updateLoad,
    getUploadUrl,
  } = useFileUploadContext();
  const [state, setState] = useSetState({ ...defaultState, schemaName });
  const router = useRouter();
  const [stateSet, setStateSet] = useState(false);

  // Set default state based on stored local forage values and only set one time
  useEffect(() => {
    if (updateLoad) return;
    if (!tableName || stateSet) return;
    setState({
      existingTable: tableName,
      schemaName,
    });
    setStateSet(true);
  }, [tableName, importOp, setState, stateSet, updateLoad]);

  const disabled = !state.existingTable;
  const uploadLink = getUploadUrl("upload");

  const onNext = () => {
    setItem("tableName", state.existingTable);
    setItem("schemaName", state.schemaName);
    setItem("importOp", importOp);
    router.push(uploadLink.href, uploadLink.as).catch(console.error);
  };

  return { onNext, disabled, state, setState };
}
