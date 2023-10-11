import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  doltDocsQueryDocName?: string;
  docName?: string;
  children?: ReactNode;
};

export default function Title(props: Props) {
  const title = getTitle(props.doltDocsQueryDocName, props.docName);

  const subtitle =
    title.toLowerCase() === "license.md" ? (
      <div className={css.description}>
        Terms under which this data is made available.
      </div>
    ) : null;

  return (
    <div className={css.title} aria-label="title-with-buttons">
      <div className={css.titleTop}>
        {title}
        {props.children}
      </div>
      {subtitle}
    </div>
  );
}

// Prioritize docName url param if it exists
function getTitle(doltDocsQueryDocName?: string, docName?: string): string {
  if (docName) return docName;
  if (doltDocsQueryDocName) return doltDocsQueryDocName;
  return "There is no doc to display.";
}
