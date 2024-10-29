import { Button } from "@dolthub/react-components";
import { useOnClickOutside } from "@dolthub/react-hooks";
import { handleCaughtError } from "@lib/errors/helpers";
import { FaChevronDown } from "@react-icons/all-files/fa/FaChevronDown";
import { FaChevronUp } from "@react-icons/all-files/fa/FaChevronUp";
import { useRef, useState } from "react";
import useUploadContext, { UploadDispatch } from "../../../contexts/upload";
import { GridDispatch, GridFunctions, GridState } from "../types";
import ExportButton from "./ExportButton";
import css from "./index.module.css";

type Props = {
  gridFunctions: GridFunctions;
  state: GridState;
  setState: GridDispatch;
  gridElement: JSX.Element;
};

type InnerProps = Props & {
  setUcState: UploadDispatch;
};

function Inner(props: InnerProps) {
  const { onExport, insertRow } = props.gridFunctions;
  const [insertOpen, setInsertOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(popupRef, () => setInsertOpen(false));

  const onPopupClick = (i: number, fn: (i: number) => void) => {
    fn(i);
    setInsertOpen(false);
  };

  function rowButton(position: string, insertAt: number) {
    return (
      <Button.Link onClick={() => onPopupClick(insertAt, insertRow)}>
        Row {position}
      </Button.Link>
    );
  }

  return (
    <div className={css.gridButtons}>
      <div ref={popupRef}>
        <Button.Link
          onClick={() => setInsertOpen(!insertOpen)}
          className={css.insertButton}
        >
          Insert {insertOpen ? <FaChevronDown /> : <FaChevronUp />}
        </Button.Link>
        {insertOpen && (
          <div className={css.popup}>
            {!props.state.selectedCell ? (
              <>
                {rowButton("top", 1)}
                {rowButton("bottom", props.state.rows.length)}
              </>
            ) : (
              <>
                {rowButton("above", props.state.selectedCell.rowIdx)}
                {rowButton("below", props.state.selectedCell.rowIdx + 1)}
              </>
            )}
          </div>
        )}
      </div>
      <ExportButton
        onExport={async () => {
          try {
            await onExport(props.gridElement);
            props.setUcState({ error: undefined });
          } catch (err) {
            handleCaughtError(err, e => props.setState({ error: e }));
          }
        }}
      />
    </div>
  );
}

export default function Buttons(props: Props) {
  const { setState: setUcState } = useUploadContext();
  return <Inner {...props} setUcState={setUcState} />;
}
