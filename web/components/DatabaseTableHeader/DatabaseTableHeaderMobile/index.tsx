import Btn from "@components/Btn";
import Loader from "@components/Loader";
import MobileSqlViewer from "@components/SqlEditor/MobileSqlViewer";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { OptionalRefParams } from "@lib/params";
import { FaChevronDown } from "@react-icons/all-files/fa/FaChevronDown";
import { FaChevronUp } from "@react-icons/all-files/fa/FaChevronUp";
import { useEffect } from "react";
import Errors from "../Errors";
import { getEditorString, getSqlString } from "../utils";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams & {
    q?: string;
    tableName?: string;
  };
  empty?: boolean;
};

export default function DatabaseTableHeaderMobile(props: Props) {
  const sqlString = getSqlString(
    props.params.q,
    props.params.tableName,
    props.empty,
  );

  const { setEditorString, showSqlEditor, toggleSqlEditor, loading } =
    useSqlEditorContext();

  useEffect(() => {
    const sqlQuery = getEditorString(
      props.params.q,
      props.params.tableName,
      props.empty,
    );
    setEditorString(sqlQuery);
  }, [props.empty, props.params.q, props.params.tableName]);

  return (
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
