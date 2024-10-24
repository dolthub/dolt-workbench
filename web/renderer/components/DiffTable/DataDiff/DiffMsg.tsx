import { isUneditableDoltSystemTable } from "@lib/doltSystemTables";
import { gqlNoRefFoundErr } from "@lib/errors/graphql";
import { errorMatches } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";
import css from "./index.module.css";

type Props = {
  err?: ApolloErrorType;
  tableName: string;
  refName: string;
  isPKTable: boolean;
};

export default function DiffMsg(props: Props) {
  return (
    <>
      {errorMatches(gqlNoRefFoundErr, props.err) && (
        <p className={css.topPadding}>
          The branch ${props.refName} does not exist in this database. Some
          functionality, such as cell buttons, will not work.
        </p>
      )}
      {isUneditableDoltSystemTable(props.tableName) && (
        <p className={css.topPadding}>
          Cannot edit system table {props.tableName}
        </p>
      )}
      {!props.isPKTable && (
        <p className={css.topPadding}>Cannot edit keyless tables</p>
      )}
    </>
  );
}
