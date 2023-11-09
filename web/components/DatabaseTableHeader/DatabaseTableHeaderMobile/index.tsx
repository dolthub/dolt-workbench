import Btn from "@components/Btn";
import Loader from "@components/Loader";
import MobileSqlViewer from "@components/SqlEditor/MobileSqlViewer";
import { useSqlEditorContext } from "@contexts/sqleditor";
import {
  ColumnForDataTableFragment,
  useDataTableQuery,
} from "@gen/graphql-types";
import { OptionalRefParams, RefParams } from "@lib/params";
import { FaChevronDown } from "@react-icons/all-files/fa/FaChevronDown";
import { FaChevronUp } from "@react-icons/all-files/fa/FaChevronUp";
import { useEffect } from "react";
import Errors from "../Errors";
import { getEditorString, getSqlString } from "../utils";
import css from "./index.module.css";

type Params = OptionalRefParams & {
  q?: string;
  tableName?: string;
};
type RequireParams = RefParams & {
  q?: string;
  tableName: string;
};

type Props = {
  params: Params;
  empty?: boolean;
};

type InnerProps = Props & {
  cols?: ColumnForDataTableFragment[];
};

type QueryProps = Props & {
  params: RequireParams;
};

function Inner(props: InnerProps) {
  const sqlString = getSqlString(
    props.params.q,
    props.params.tableName,
    props.empty,
  );

  const { setEditorString, showSqlEditor, toggleSqlEditor, loading } =
    useSqlEditorContext();

  useEffect(() => {
    const sqlRes = getEditorString(
      props.params.q,
      props.params.tableName,
      props.empty,
      props.cols,
    );
    setEditorString(sqlRes.sqlQuery);
  }, [
    props.cols,
    props.empty,
    props.params.q,
    props.params.tableName,
    setEditorString,
  ]);

  return props.empty ? (
    <div className={css.empty}>Databases are read-only.</div>
  ) : (
    <div className={css.editorContainer}>
      <Loader loaded={!loading} />
      <div className={css.editorHeader}>
        <Btn className={css.queryHeader} onClick={() => toggleSqlEditor()}>
          <span>Query</span>

          {showSqlEditor ? (
            <FaChevronDown className={css.caret} />
          ) : (
            <FaChevronUp className={css.caret} />
          )}
        </Btn>
      </div>
      {showSqlEditor && (
        <MobileSqlViewer
          {...props}
          data-cy="mobile-sql-viewer-expanded"
          sqlString={sqlString}
        />
      )}
      <Errors />
    </div>
  );
}

function WithQuery(props: QueryProps) {
  const res = useDataTableQuery({
    variables: props.params,
  });
  if (res.loading) return <Loader loaded={false} />;
  return <Inner {...props} cols={res.data?.table.columns} />;
}

export default function DatabaseTableHeaderMobile(props: Props) {
  if (props.params.tableName && props.params.refName) {
    return (
      <WithQuery
        {...props}
        params={{
          ...props.params,
          refName: props.params.refName,
          tableName: props.params.tableName,
        }}
      />
    );
  }
  return <Inner {...props} />;
}
