import Button from "@components/Button";
import Link from "@components/links/Link";
import { useDiffContext } from "@contexts/diff";
import { DiffSummaryFragment, TableDiffType } from "@gen/graphql-types";
import { useRouter } from "next/router";
import css from "./index.module.css";

type TableProps = {
  diffSummary: DiffSummaryFragment;
  displayedTableName: string;
};

type Props = {
  isActive: boolean;
  diffSummary: DiffSummaryFragment;
};

function TableLink({ displayedTableName, diffSummary }: TableProps) {
  const router = useRouter();
  const { stayWithinPage, setActiveTableName } = useDiffContext();
  const queryDelimiter = router.asPath.includes("?refName") ? "&" : "?";
  const asPathWithoutQuery = router.asPath.split(
    `${queryDelimiter}tableName=`,
  )[0];
  const url = {
    href: `${asPathWithoutQuery}${queryDelimiter}tableName=${diffSummary.tableName}`,
    as: `${asPathWithoutQuery}${queryDelimiter}tableName=${diffSummary.tableName}`,
  };

  if (stayWithinPage) {
    return (
      <Button.Link
        onClick={() => setActiveTableName(diffSummary.tableName)}
        className={css.tableButton}
      >
        {displayedTableName}
      </Button.Link>
    );
  }
  return <Link {...url}>{displayedTableName}</Link>;
}

export default function TableName(props: Props) {
  const displayedTableName =
    props.diffSummary.tableType === TableDiffType.Renamed
      ? `${props.diffSummary.fromTableName} → ${props.diffSummary.toTableName}`
      : props.diffSummary.tableName;

  return props.isActive ? (
    <span>{displayedTableName}</span>
  ) : (
    <TableLink {...props} displayedTableName={displayedTableName} />
  );
}
