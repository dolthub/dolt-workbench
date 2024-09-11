import SqlEditor from "@components/SqlEditor";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Btn, Loader } from "@dolthub/react-components";
import { DatabasePageParams } from "@lib/params";
import { BiPencil } from "@react-icons/all-files/bi/BiPencil";
import dynamic from "next/dynamic";
import Buttons from "./Buttons";
import Errors from "./Errors";
import css from "./index.module.css";
import { useSqlStrings } from "./useSqlStrings";

const AceEditor = dynamic(async () => import("@components/AceEditor"), {
  ssr: false,
});

type Props = {
  params: DatabasePageParams;
  empty?: boolean;
};

export default function DatabaseTableHeader(props: Props) {
  const { sqlString, editorString } = useSqlStrings(props.params, props.empty);
  const { showSqlEditor, toggleSqlEditor, loading } = useSqlEditorContext();

  return (
    <div className={css.editorContainer}>
      <Loader loaded={!loading} />
      <div className={css.editorHeader}>
        <div className={css.queryHeader}>
          Query
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
