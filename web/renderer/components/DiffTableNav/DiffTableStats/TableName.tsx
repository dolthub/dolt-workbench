import Link from "@components/links/Link";
import { useDiffContext } from "@contexts/diff";
import { Button } from "@dolthub/react-components";
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

  const queryDelimiter = router.asPath.includes("?refName") ? "&" : "?";
  const asPathWithoutQuery = router.asPath.split(
    `${queryDelimiter}tableName=`,
  )[0];
  const url = `${asPathWithoutQuery}${queryDelimiter}tableName=${diffSummary.tableName}`;
  return (
    <Link
      href={url}
      shallow
      onClick={() => setActiveTableName(diffSummary.tableName)}
    >
      {displayedTableName}
    </Link>
  );
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
