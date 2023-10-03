import CopyButton from "@components/CopyButton";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { FaChevronDown } from "@react-icons/all-files/fa/FaChevronDown";
import { FaChevronUp } from "@react-icons/all-files/fa/FaChevronUp";
import css from "./index.module.css";

type Props = {
  sqlString?: string;
  // params: { refName?: string };
};

export default function Buttons(props: Props) {
  const { toggleSqlEditor, showSqlEditor } = useSqlEditorContext();
  return (
    <div className={css.left}>
      <div className={css.buttons}>
        {props.sqlString && (
          <>
            {/* <SaveQueryButton {...props} query={props.sqlString} /> */}
            {/* <CreateViewButton {...props} query={props.sqlString} /> */}
          </>
        )}
        {props.sqlString && <CopyButton text={props.sqlString} />}
      </div>
      {showSqlEditor ? (
        <FaChevronDown
          className={css.caret}
          onClick={() => toggleSqlEditor()}
        />
      ) : (
        <FaChevronUp className={css.caret} onClick={() => toggleSqlEditor()} />
      )}
    </div>
  );
}
