import Btn from "@components/Btn";
import Loader from "@components/Loader";
import SqlEditor from "@components/SqlEditor";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { OptionalRefParams } from "@lib/params";
import { BiPencil } from "@react-icons/all-files/bi/BiPencil";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import Buttons from "./Buttons";
import Errors from "./Errors";
import css from "./index.module.css";
import { getEditorString, getSqlString } from "./utils";

const AceEditor = dynamic(async () => import("@components/AceEditor"), {
  ssr: false,
});

type Props = {
  params: OptionalRefParams & {
    q?: string;
    tableName?: string;
  };
  empty?: boolean;
};

export default function DatabaseTableHeader(props: Props) {
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
    const sqlQuery = getEditorString(
      props.params.q,
      props.params.tableName,
      props.empty,
    );
    setEditorString(sqlQuery);
  }, [props.params.q, props.params.tableName, props.empty]);

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
        <Buttons sqlString={editorString} params={props.params} />
      </div>
      {showSqlEditor ? (
        <SqlEditor {...props} />
      ) : (
        <Btn
          data-cy="sql-editor-collapsed"
          onClick={() => toggleSqlEditor()}
          className={css.editorButton}
        >
          <div className={css.editorText}>
            <AceEditor
              value={sqlString}
              name="AceViewer"
              fontSize={13}
              readOnly
              wrapEnabled
              showGutter={false}
              maxLines={4}
              light
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
