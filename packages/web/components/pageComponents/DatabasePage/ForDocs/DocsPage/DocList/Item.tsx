import DocLink from "@components/links/DocLink";
import { DocForDocPageFragment } from "@gen/graphql-types";
import Maybe from "@lib/Maybe";
import { RefParams } from "@lib/params";
import { GiScales } from "@react-icons/all-files/gi/GiScales";
import { IoBookOutline } from "@react-icons/all-files/io5/IoBookOutline";
import cx from "classnames";
import { useEffect, useRef } from "react";
import css from "./index.module.css";

type Props = {
  rowData: Maybe<DocForDocPageFragment>;
  params: RefParams & {
    docName?: string;
  };
  active?: boolean;
};

export default function DocListItem({ active, ...props }: Props) {
  const docName = props.rowData?.docRow?.columnValues[0].displayValue;
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  if (!docName) return null;

  return (
    <li>
      <DocLink
        params={{ ...props.params, docName }}
        className={cx(css.link, { [css.active]: active })}
      >
        <span>
          <DocIcon docName={docName} />
          {docName}
        </span>
      </DocLink>
    </li>
  );
}

function DocIcon({ docName }: { docName: string }) {
  if (docName === "LICENSE.md") {
    return <GiScales />;
  }
  return <IoBookOutline />;
}
