import { ExternalLink } from "@dolthub/react-components";
import { docsLink } from "@lib/constants";
import cx from "classnames";
import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  path?: string;
  children?: ReactNode;
  className?: string;
  systemTableType?: string;
  ["data-cy"]?: string;
};

export default function DocsLink(props: Props) {
  const path = getPath(props.path, props.systemTableType);
  return (
    <ExternalLink
      className={cx(props.className, css.link)}
      href={`${docsLink}${path}`}
      data-cy={props["data-cy"]}
    >
      {props.children}
    </ExternalLink>
  );
}

function getPath(path?: string, systemTableType?: string): string {
  if (!systemTableType) {
    return path ?? "";
  }
  return `/sql-reference/version-control/dolt-system-tables#${getDocsPath(
    systemTableType,
  )}`;
}

function getDocsPath(tableType: string) {
  if (tableType === "diff" || tableType === "history") {
    return `dolt_${tableType}_usdtablename`;
  }
  return `dolt_${tableType}`;
}
