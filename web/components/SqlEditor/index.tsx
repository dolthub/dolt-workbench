import Popup from "@components/Popup";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { OptionalRefParams } from "@lib/params";
import { BsFillQuestionCircleFill } from "@react-icons/all-files/bs/BsFillQuestionCircleFill";
import { debounce } from "lodash";
import dynamic from "next/dynamic";
import { useRef } from "react";
import Commands from "./Commands";
import RightButtons from "./RightButtons";
import css from "./index.module.css";
import useSqlEditorCommands from "./useSqlEditorCommands";

const AceEditor = dynamic(async () => import("@components/AceEditor"), {
  ssr: false,
});

type Props = {
  params: OptionalRefParams;
  ["data-cy"]?: string;
  showDefaultQueryInfo?: boolean;
};

export default function SqlEditor(props: Props) {
  const { editorString, setEditorString } = useSqlEditorContext("Tables");
  const aceEditor = useRef<HTMLElement>(null);
  const { commands, setSubmitting } = useSqlEditorCommands(props.params);

  return (
    <div className={css.ace} data-cy={props["data-cy"]}>
      <div className={css.editor}>
        <AceEditor
          innerRef={aceEditor}
          value={editorString}
          name="AceEditor"
          fontSize={15}
          maxLines={20}
          minLines={6}
          focus
          wrapEnabled
          onLoad={editor => {
            editor.gotoLine(1, 9, true);
          }}
          onChange={debounce(setEditorString, 100)}
          commands={commands}
        />
      </div>
      <RightButtons setSubmitting={setSubmitting} />
      <Commands />
      {props.showDefaultQueryInfo && (
        <div className={css.question}>
          <Popup
            on="hover"
            position="bottom right"
            contentStyle={{ width: "450px", padding: "15px" }}
            trigger={
              <span className={css.learnMore}>
                <BsFillQuestionCircleFill />{" "}
                <div>Learn more about this query</div>
              </span>
            }
          >
            <p>
              This query represents the results you would get by running `SELECT
              * FROM [tableName]`. SQL queries on DoltHub are limited to 200
              rows. The ORDER BY clause makes the results of the query
              deterministic in the presence of the LIMIT.
            </p>
          </Popup>
        </div>
      )}
    </div>
  );
}
