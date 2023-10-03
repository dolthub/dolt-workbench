import { useSqlEditorContext } from "@contexts/sqleditor";
import { OptionalRefParams } from "@lib/params";
import { isMutation } from "@lib/parseSqlQuery";
import { debounce } from "lodash";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import BottomButtons from "./BottomButtons";
import css from "./index.module.css";

const AceEditor = dynamic(async () => import("@components/AceEditor"), {
  ssr: false,
});

type Props = {
  params: OptionalRefParams;
  setOpenSqlEditor: (s: boolean) => void;
};

export default function MobileSqlEditor(props: Props) {
  const { editorString, setEditorString, executeQuery, setError } =
    useSqlEditorContext("Tables");
  const aceEditor = useRef<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!submitting) return;
    if (isMutation(editorString)) {
      setError(new Error("You currently cannot edit data."));
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    executeQuery({ ...props.params, query: editorString }).catch(console.error);
  }, [
    submitting,
    executeQuery,
    setSubmitting,
    editorString,
    props.params,
    setError,
  ]);

  return (
    <div>
      <div className={css.editor} data-cy="mobile-sql-editor">
        <AceEditor
          innerRef={aceEditor}
          value={editorString}
          name="AceEditor"
          fontSize={15}
          maxLines={Infinity}
          showGutter={false}
          focus
          wrapEnabled
          onLoad={editor => {
            editor.gotoLine(1, 9, true);
            editor.commands.removeCommand("find");
          }}
          onChange={debounce(setEditorString, 100)}
        />
        <BottomButtons
          setSubmitting={setSubmitting}
          setOpenSqlEditor={props.setOpenSqlEditor}
        />
      </div>
    </div>
  );
}
