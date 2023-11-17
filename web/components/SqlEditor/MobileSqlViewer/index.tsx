import Btn from "@components/Btn";
import Button from "@components/Button";
import CopyButton from "@components/CopyButton";
import { OptionalRefParams } from "@lib/params";
import { BsPencil } from "@react-icons/all-files/bs/BsPencil";
import dynamic from "next/dynamic";
import { useState } from "react";
import MobileSqlEditor from "../MobileSqlEditor";
import css from "./index.module.css";

const AceEditor = dynamic(async () => import("@components/AceEditor"), {
  ssr: false,
});

type Props = {
  params: OptionalRefParams & {
    q?: string;
    tableName?: string;
  };
  empty?: boolean;
  sqlString: string;
};

export default function MobileSqlViewer(props: Props) {
  const [openSqlEditor, setOpenSqlEditor] = useState(false);

  return (
    <>
      <div className={css.query} data-cy="mobile-sql-viewer">
        <Btn
          data-cy="mobile-sql-editor-button"
          onClick={() => setOpenSqlEditor(true)}
        >
          <div className={css.editorText}>
            <AceEditor
              value={props.sqlString}
              name="AceViewer"
              fontSize={13}
              readOnly
              wrapEnabled
              showGutter={false}
              minLines={openSqlEditor ? 6 : 1}
              maxLines={50}
              focus={false}
              light
            />
          </div>
        </Btn>
        <div className={css.buttons}>
          <Button className={css.edit} onClick={() => setOpenSqlEditor(true)}>
            <BsPencil />
            Edit Query
          </Button>
          {!!props.sqlString && (
            <CopyButton text={props.sqlString} mobileCopyQuery />
          )}
        </div>
      </div>
      {openSqlEditor && (
        <MobileSqlEditor {...props} setOpenSqlEditor={setOpenSqlEditor} />
      )}
    </>
  );
}
