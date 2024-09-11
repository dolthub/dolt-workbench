import { Maybe } from "@dolthub/web-utils";
import { SchemaDiffForTableListFragment } from "@gen/graphql-types";
import ReactDiffViewer from "react-diff-viewer";
import css from "./index.module.css";

type Props = {
  schemaDiff?: Maybe<SchemaDiffForTableListFragment>;
};

export default function SchemaDiff({ schemaDiff }: Props) {
  if (!schemaDiff) {
    return <div className={css.container}>No schema changes in this diff</div>;
  }

  const { leftLines, rightLines } = schemaDiff;

  return (
    <div className={css.container}>
      <ReactDiffViewer
        oldValue={leftLines}
        newValue={rightLines}
        splitView
        disableWordDiff
      />
    </div>
  );
}
