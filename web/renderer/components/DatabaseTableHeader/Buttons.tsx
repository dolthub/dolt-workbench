import { useSqlEditorContext } from "@contexts/sqleditor";
import { CopyButton } from "@dolthub/react-components";
import { OptionalRefParams } from "@lib/params";
import { FaChevronDown } from "@react-icons/all-files/fa/FaChevronDown";
import { FaChevronUp } from "@react-icons/all-files/fa/FaChevronUp";
import CreateViewButton from "./CreateViewButton";
import css from "./index.module.css";

type Props = {
  sqlString?: string;
  params: OptionalRefParams;
};

export default function Buttons(props: Props) {
  const { toggleSqlEditor, showSqlEditor } = useSqlEditorContext();
  return (
    <div className={css.left}>
      <div className={css.buttons}>
        {props.sqlString && (
          <>
            <CreateViewButton {...props} query={props.sqlString} />
            <CopyButton text={props.sqlString} />
          </>
        )}
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
