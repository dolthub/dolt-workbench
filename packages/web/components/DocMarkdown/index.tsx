import { DocForDocPageFragment } from "@gen/graphql-types";
import Maybe from "@lib/Maybe";
import { RefParams } from "@lib/params";
import { useState } from "react";
import Buttons from "./Buttons";
import MarkdownBody from "./MarkdownBody";
import Title from "./Title";
import css from "./index.module.css";

type Props = {
  rowData: Maybe<DocForDocPageFragment>;
  params: RefParams & { docName?: string };
};

export default function DocMarkdown({ params, rowData }: Props) {
  const doltDocsQueryDocName = rowData?.docRow?.columnValues[0].displayValue;
  const markdown = rowData?.docRow?.columnValues[1].displayValue;
  const docName = params.docName ?? doltDocsQueryDocName;

  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className={css.markdown}>
      <div className={css.titleGroup}>
        <Title
          doltDocsQueryDocName={doltDocsQueryDocName}
          docName={params.docName}
        >
          <Buttons
            params={{ ...params, docName }}
            doltDocsQueryDocName={doltDocsQueryDocName}
            setShowEditor={setShowEditor}
            showEditor={showEditor}
          />
        </Title>
      </div>
      <div className={css.bodyContainer}>
        <MarkdownBody
          params={params}
          doltDocsQueryDocName={doltDocsQueryDocName}
          markdown={markdown}
          showEditor={showEditor}
          setShowEditor={setShowEditor}
          isDoc
        />
      </div>
    </div>
  );
}
