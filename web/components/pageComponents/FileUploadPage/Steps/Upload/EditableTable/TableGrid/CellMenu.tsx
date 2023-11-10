import useOnClickOutside from "@hooks/useOnClickOutside";
import { useRef } from "react";
import "react-data-grid/lib/styles.css";
import css from "./index.module.css";
import { ContextMenuProps, GridDispatch, GridFunctions } from "./types";

type Props = {
  gf: GridFunctions;
  contextMenuProps: ContextMenuProps;
  setState: GridDispatch;
};

export default function CellMenu(props: Props) {
  const menuRef = useRef<HTMLMenuElement | null>(null);
  useOnClickOutside(menuRef, () => props.setState({ contextMenuProps: null }));

  return (
    <menu
      ref={menuRef}
      className={css.menu}
      style={{
        top: props.contextMenuProps.top,
        left: props.contextMenuProps.left,
      }}
    >
      <li>
        <button
          type="button"
          onClick={() => {
            props.gf.onRowDelete(props.contextMenuProps.rowIdx);
            props.setState({ contextMenuProps: null });
          }}
        >
          Delete Row
        </button>
      </li>
      <li>
        <button
          type="button"
          onClick={() => {
            props.gf.onRowInsertAbove(props.contextMenuProps.rowIdx);
            props.setState({ contextMenuProps: null });
          }}
        >
          Insert Row Above
        </button>
      </li>
      <li>
        <button
          type="button"
          onClick={() => {
            props.gf.onRowInsertBelow(props.contextMenuProps.rowIdx);
            props.setState({ contextMenuProps: null });
          }}
        >
          Insert Row Below
        </button>
      </li>
    </menu>
  );
}
