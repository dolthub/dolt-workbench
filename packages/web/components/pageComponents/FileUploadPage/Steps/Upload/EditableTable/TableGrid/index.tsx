import ErrorMsg from "@components/ErrorMsg";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import cx from "classnames";
import { useEffect } from "react";
import DataGrid from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { createPortal } from "react-dom";
import Buttons from "./Buttons";
import CellMenu from "./CellMenu";
import { indexColumn } from "./IndexColumn";
import css from "./index.module.css";
import { GridDispatch, GridFunctions, GridState } from "./types";
import useGrid from "./useGrid";

type Props = {
  columns: ColumnForDataTableFragment[];
};

type InnerProps = Props & {
  gf: GridFunctions;
  state: GridState;
  setState: GridDispatch;
};

function Inner(props: InnerProps) {
  useEffect(() => {
    document.addEventListener("paste", props.gf.handlePaste);
    return () => document.removeEventListener("paste", props.gf.handlePaste);
  });

  const gridElement = (
    <DataGrid
      columns={[
        indexColumn,
        ...props.state.columns.map(col => {
          return {
            ...col,
            // headerRenderer: HeaderRenderer,
          };
        }),
      ]}
      topSummaryRows={[{ _id: -1 }]}
      rows={props.state.rows}
      rowKeyGetter={row => row._id}
      onRowsChange={rows => props.setState({ rows })}
      onFill={props.gf.onFill}
      className={cx("rdg-light", css.dataGrid)}
      style={{ resize: "both" }}
      rowHeight={r => (r.type === "ROW" && r.row._id === 0 ? 35 : 30)}
      onCellClick={cell => {
        props.setState({
          selectedCell: { rowIdx: cell.row._idx, idx: cell.column.idx },
        });
      }}
      onCellKeyDown={cell => {
        props.setState({
          selectedCell: { rowIdx: cell.row._idx, idx: cell.column.idx },
        });
      }}
      onCellContextMenu={({ row }, e) => {
        e.preventGridDefault();
        // Do not show the default context menu
        e.preventDefault();
        props.setState({
          contextMenuProps: {
            rowIdx: props.state.rows.indexOf(row),
            top: e.clientY,
            left: e.clientX,
          },
        });
      }}
    />
  );

  return (
    <div>
      <div className={css.top}>
        <div className={css.msg}>* First row should contain column names</div>
        <Buttons
          gridFunctions={props.gf}
          state={props.state}
          setState={props.setState}
          gridElement={gridElement}
        />
      </div>
      <ErrorMsg err={props.state.error} />
      {gridElement}

      {props.state.contextMenuProps !== null &&
        createPortal(
          <CellMenu
            {...props}
            contextMenuProps={props.state.contextMenuProps}
          />,
          document.body,
        )}
    </div>
  );
}

export default function TableGrid(props: Props) {
  const { state, setState, gridFunctions: gf } = useGrid(props.columns);
  return <Inner {...props} {...{ state, setState, gf }} />;
}

// function HeaderRenderer(props: HeaderRendererProps<Row>) {
//   return (
//     <ContextMenuTrigger
//       id="grid-header-context-menu"
//       collect={() => {
//         return { column: props.column };
//       }}
//     >
//       <div>{props.column.name}</div>
//     </ContextMenuTrigger>
//   );
// }

// function RowRenderer(props: RowRendererProps<Row>) {
//   return (
//     <ContextMenuTrigger
//       id="grid-row-context-menu"
//       collect={() => {
//         return { rowIdx: props.rowIdx };
//       }}
//       disable={props.rowIdx === 0}
//     >
//       <GridRow {...props} />
//     </ContextMenuTrigger>
//   );
// }
