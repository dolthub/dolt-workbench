import Markdown from "@components/Markdown";
import { RefParams } from "@lib/params";
import Editor from "./Editor";
import css from "./index.module.css";
import { isDefaultDocOrDocNamesMatch } from "./utils";

type Props = {
  params: RefParams & { docName?: string };
  doltDocsQueryDocName?: string;
  markdown?: string;
  showEditor: boolean;
  setShowEditor: (s: boolean) => void;
  isDoc?: boolean;
};

export default function MarkdownBody(props: Props) {
  if (
    !isDefaultDocOrDocNamesMatch(
      props.params.docName,
      props.doltDocsQueryDocName,
    )
  ) {
    return (
      <div className={css.body} aria-label="doc-not-found">
        {props.params.docName ?? "Doc"} not found
      </div>
    );
  }

  if (props.showEditor) {
    return (
      <div className={css.body}>
        <Editor
          setShowEditor={props.setShowEditor}
          markdown={props.markdown ?? ""}
          params={{
            ...props.params,
            docName: props.doltDocsQueryDocName || props.params.docName || "",
          }}
          isDoc={props.isDoc}
        />
      </div>
    );
  }

  return (
    <Markdown
      className={css.body}
      value={props.markdown ?? ""}
      baseTextSize
      data-cy="doc-markdown"
      isDoc={props.isDoc}
    />
  );
}
