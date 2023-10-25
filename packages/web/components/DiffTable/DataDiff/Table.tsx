import { ApolloError } from "@apollo/client";
import useRole from "@hooks/useRole";
import {
  isDoltSystemTable,
  isUneditableDoltSystemTable,
} from "@lib/doltSystemTables";
import { gqlNoRefFoundErr } from "@lib/errors/graphql";
import { errorMatches } from "@lib/errors/helpers";
import { DiffParams } from "@lib/params";
import cx from "classnames";
import { useState } from "react";
import Body from "./Body";
import Head from "./Head";
import css from "./index.module.css";
import { RowDiffState } from "./state";
import {
  HiddenColIndexes,
  SetHiddenColIndexes,
  getColumnInitialStatus,
} from "./utils";

type Props = {
  state: RowDiffState;
  setHiddenColIndexes: SetHiddenColIndexes;
  hiddenColIndexes: HiddenColIndexes;
  params: DiffParams & {
    tableName: string;
  };
  hideCellButtons?: boolean;
  refName: string;
  error?: ApolloError;
  forMobile?: boolean;
  isPKTable?: boolean;
};

export default function Table(props: Props) {
  const initialColumnStatus = getColumnInitialStatus(props.state.cols);
  const [columnStatus, setColumnStatus] = useState(initialColumnStatus);
  const { canWriteToDB } = useRole();
  const hideCellButtons =
    props.hideCellButtons ||
    errorMatches(gqlNoRefFoundErr, props.error) ||
    !props.isPKTable;

  return (
    <table
      className={cx(css.diffTable, {
        [css.diffTableColsHidden]: !!props.hiddenColIndexes.length,
      })}
      data-cy={`data-diff-${props.params.tableName}${
        props.forMobile ? "-mobile" : ""
      }`}
    >
      <div className={css.line} />
      <Head
        {...props}
        cols={props.state.cols}
        hideCellButtons={
          hideCellButtons || isDoltSystemTable(props.params.tableName)
        }
        columnStatus={columnStatus}
        setColumnStatus={setColumnStatus}
        refName={props.refName}
      />
      <Body
        {...props}
        rowDiffs={props.state.rowDiffs}
        cols={props.state.cols}
        hideCellButtons={
          hideCellButtons || isUneditableDoltSystemTable(props.params.tableName)
        }
        columnStatus={columnStatus}
        setColumnStatus={setColumnStatus}
        userCanWrite={canWriteToDB}
        refName={props.refName}
      />
    </table>
  );
}
