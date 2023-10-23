import Button from "@components/Button";
import useOnClickOutside from "@hooks/useOnClickOutside";
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

  function rowButton(position: string, insertAt: number, disabled?: boolean) {
    return (
      <Button.Link
        onClick={() => onPopupClick(insertAt, insertRow)}
        disabled={disabled}
      >
        Row {position}
      </Button.Link>
    );
  }

  // function colButton(position: string, insertAt: number) {
  //   return (
  //     <Button.Link
  //       onClick={() => onPopupClick(insertAt, onAddColumn)}
  //     >
  //       Column {position}
  //     </Button.Link>
  //   );
  // }

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
                {rowButton(
                  "above",
                  props.state.selectedCell.rowIdx,
                  props.state.selectedCell.rowIdx === 0,
                )}
                {rowButton("below", props.state.selectedCell.rowIdx + 1)}
              </>
            )}
            {/* <div className={css.rowLine} />
            {!props.state.selectedCell ? (
              <>
                {colButton("start", 0)}
                {colButton("end", props.state.columns.length)}
              </>
            ) : (
              <>
                {colButton("left", props.state.selectedCell.idx - 1)}
                {colButton("right", props.state.selectedCell.idx)}
              </>
            )} */}
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
