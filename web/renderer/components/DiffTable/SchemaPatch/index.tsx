import { Maybe } from "@dolthub/web-utils";
import ReactDiffViewer from "react-diff-viewer";
import css from "./index.module.css";

type Props = {
  schemaPatch?: Maybe<string[]>;
};

export default function SchemaPatch({ schemaPatch }: Props) {
  if (!schemaPatch) {
    return <div className={css.patch}>No schema changes in this diff</div>;
  }
  const content = schemaPatch.join("\n");
  return (
    <div className={css.patch}>
      <ReactDiffViewer
        oldValue={content}
        newValue={content}
        splitView={false}
        showDiffOnly={false}
      />
    </div>
  );
}
