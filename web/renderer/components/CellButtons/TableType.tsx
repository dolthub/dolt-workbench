import DocsLink from "@components/links/DocsLink";

type Props = {
  isView: boolean;
  isDoltSystemTable: boolean;
};

export default function TableType({
  isView,
  isDoltSystemTable = false,
}: Props): JSX.Element | null {
  if (isView) {
    return (
      <span>
        for <DocsLink systemTableType="schemas">Views</DocsLink>
      </span>
    );
  }
  if (isDoltSystemTable) {
    return (
      <span>
        for{" "}
        <DocsLink path="/reference/sql/dolt-system-tables">
          Dolt system tables
        </DocsLink>
      </span>
    );
  }
  return null;
}
