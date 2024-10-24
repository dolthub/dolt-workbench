import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { Maybe } from "@dolthub/web-utils";
import { DocForDocPageFragment } from "@gen/graphql-types";
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
          <HideForNoWritesWrapper params={params}>
            <Buttons
              params={{ ...params, docName }}
              doltDocsQueryDocName={doltDocsQueryDocName}
              setShowEditor={setShowEditor}
              showEditor={showEditor}
            />
          </HideForNoWritesWrapper>
        </Title>
      </div>
      <div className={css.bodyContainer}>
        <MarkdownBody
          params={params}
          doltDocsQueryDocName={doltDocsQueryDocName}
          markdown={markdown}
          showEditor={showEditor}
          setShowEditor={setShowEditor}
        />
      </div>
    </div>
  );
}
