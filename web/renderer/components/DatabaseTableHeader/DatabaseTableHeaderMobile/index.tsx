import MobileSqlViewer from "@components/SqlEditor/MobileSqlViewer";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Btn, Loader } from "@dolthub/react-components";
import { DatabasePageParams } from "@lib/params";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Errors from "../Errors";
import { useSqlStrings } from "../useSqlStrings";
import css from "./index.module.css";

type Props = {
  params: DatabasePageParams;
  empty?: boolean;
};

export default function DatabaseTableHeaderMobile(props: Props) {
  const { sqlString } = useSqlStrings(props.params, props.empty);
  const { showSqlEditor, toggleSqlEditor, loading } = useSqlEditorContext();

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
