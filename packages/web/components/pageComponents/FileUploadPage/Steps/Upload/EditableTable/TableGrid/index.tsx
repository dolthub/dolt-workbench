import ErrorMsg from "@components/ErrorMsg";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import cx from "classnames";
import { useEffect } from "react";
import DataGrid from "react-data-grid";
import Buttons from "./Buttons";
import { indexColumn } from "./IndexColumn";
import css from "./index.module.css";
import { GridDispatch, GridFunctions, GridState, Row } from "./types";
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
      rows={props.state.rows}
      rowKeyGetter={row => row._id}
      onRowsChange={rows => props.setState({ rows })}
      // onScroll={props.gf.handleScroll}
      onFill={props.gf.onFill}
      // rowRenderer={RowRenderer}
      className={cx("rdg-light", css.dataGrid)}
      style={{ resize: "both" }}
      rowHeight={({ row }) => ((row as Row)._id === 0 ? 35 : 30)}
      rowClass={row => (row._id === 0 ? css.headerRow : undefined)}
      onSelectedCellChange={c => props.setState({ selectedCell: c })}
    />
  );

  // const rowMenu = (
  //   <ContextMenu id="grid-row-context-menu" className={css.contextMenu}>
  //     <MenuItem onClick={props.gf.onRowDelete}>Delete Row</MenuItem>
  //     <MenuItem onClick={props.gf.onRowInsertAbove}>Insert Row Above</MenuItem>
  //     <MenuItem onClick={props.gf.onRowInsertBelow}>Insert Row Below</MenuItem>
  //   </ContextMenu>
  // );

  // const headerMenu = (
  //   <ContextMenu id="grid-header-context-menu" className={css.contextMenu}>
  //     <MenuItem onClick={props.gf.onDeleteColumn}>Delete Column</MenuItem>
  //   </ContextMenu>
  // );

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
      {/* {createPortal(rowMenu, document.body)}
      {createPortal(headerMenu, document.body)} */}
      {props.state.loading && (
        <div className={css.loading}>Loading more rows</div>
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
