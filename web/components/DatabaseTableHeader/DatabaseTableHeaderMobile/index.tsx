import Btn from "@components/Btn";
import Loader from "@components/Loader";
import MobileSqlViewer from "@components/SqlEditor/MobileSqlViewer";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { FaChevronDown } from "@react-icons/all-files/fa/FaChevronDown";
import { FaChevronUp } from "@react-icons/all-files/fa/FaChevronUp";
import Errors from "../Errors";
import { Params, useSqlStrings } from "../useSqlStrings";
import css from "./index.module.css";

type Props = {
  params: Params;
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
