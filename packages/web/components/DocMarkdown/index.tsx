import { DocForDocPageFragment } from "@gen/graphql-types";
import Maybe from "@lib/Maybe";
import { RefParams } from "@lib/params";
import cx from "classnames";
import { useState } from "react";
import MarkdownBody from "./MarkdownBody";
import Title from "./Title";
import css from "./index.module.css";

type Props = {
  rowData: Maybe<DocForDocPageFragment>;
  params: RefParams & { docName?: string };
  hiddenForMobile?: boolean;
};

export default function DocMarkdown({
  params,
  rowData,
  hiddenForMobile,
}: Props) {
  const doltDocsQueryDocName = rowData?.docRow?.columnValues[0].displayValue;
  const markdown = rowData?.docRow?.columnValues[1].displayValue;
  // const docName = params.docName ?? doltDocsQueryDocName;

  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className={css.markdown} data-cy="db-doc-markdown">
      <div
        className={cx(css.titleGroup, {
          [css.hiddenForMobile]: hiddenForMobile,
        })}
        data-cy="doc-title-group"
      >
        <Title
          doltDocsQueryDocName={doltDocsQueryDocName}
          docName={params.docName}
        />
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
