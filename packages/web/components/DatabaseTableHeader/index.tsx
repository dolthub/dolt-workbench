import Btn from "@components/Btn";
import Loader from "@components/Loader";
import SqlEditor from "@components/SqlEditor";
import { useSqlEditorContext } from "@contexts/sqleditor";
import {
  ColumnForDataTableFragment,
  useDataTableQuery,
} from "@gen/graphql-types";
import { OptionalRefParams, RefParams } from "@lib/params";
import { BiPencil } from "@react-icons/all-files/bi/BiPencil";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Buttons from "./Buttons";
import Errors from "./Errors";
import css from "./index.module.css";
import { getEditorString, getSqlString } from "./utils";

const AceEditor = dynamic(async () => import("@components/AceEditor"), {
  ssr: false,
});

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
  const [showDefaultQueryInfo, setShowDefaultQueryInfo] = useState(false);

  const sqlString = getSqlString(
    props.params.q,
    props.params.tableName,
    props.empty,
  );

  const {
    editorString,
    setEditorString,
    showSqlEditor,
    toggleSqlEditor,
    loading,
  } = useSqlEditorContext();

  useEffect(() => {
    const sqlRes = getEditorString(
      props.params.q,
      props.params.tableName,
      props.empty,
      props.cols,
    );
    setEditorString(sqlRes.sqlQuery);
    setShowDefaultQueryInfo(sqlRes.showDefaultQueryInfo);
  }, [props.cols]);

  return (
    <div className={css.editorContainer}>
      <Loader loaded={!loading} />
      <div className={css.editorHeader}>
        <div className={css.queryHeader}>
          {getQueryTitle(sqlString, props.empty)}
          {props.empty && (
            <span className={css.sampleQueryDir}>
              <Btn onClick={() => toggleSqlEditor()}>open the sql editor</Btn>{" "}
              to run the query
            </span>
          )}
        </div>
        <Buttons sqlString={editorString} />
      </div>
      {showSqlEditor ? (
        <SqlEditor {...props} showDefaultQueryInfo={showDefaultQueryInfo} />
      ) : (
        <Btn
          data-cy="sql-editor-collapsed"
          onClick={() => toggleSqlEditor()}
          className={css.editorButton}
        >
          <div className={css.editorText}>
            <AceEditor
              className="ace-view"
              value={sqlString}
              name="AceViewer"
              fontSize={13}
              readOnly
              wrapEnabled
              showGutter={false}
              maxLines={4}
            />
            <span className={css.editIcon}>
              <BiPencil />
            </span>
          </div>
        </Btn>
      )}
      <Errors />
    </div>
  );
}

function getQueryTitle(sqlString: string, empty?: boolean): string {
  if (sqlString === "SHOW TABLES") return "Query";
  if (empty) return "Sample Query";
  return "Query";
}

function WithQuery(props: QueryProps) {
  const res = useDataTableQuery({
    variables: props.params,
  });
  if (res.loading) return <Loader loaded={false} />;
  return <Inner {...props} cols={res.data?.table.columns} />;
}

export default function DatabaseTableHeader(props: Props) {
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
