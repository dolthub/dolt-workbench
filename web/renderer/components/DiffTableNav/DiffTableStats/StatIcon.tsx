import { TableDiffType } from "@gen/graphql-types";
import {
  VscDiffAdded,
  VscDiffModified,
  VscDiffRemoved,
  VscDiffRenamed,
} from "react-icons/vsc";

type Props = {
  tableType: TableDiffType;
};

export default function StatIcon({ tableType }: Props) {
  switch (tableType) {
    case TableDiffType.Added:
      return <VscDiffAdded />;
    case TableDiffType.Dropped:
      return <VscDiffRemoved />;
    case TableDiffType.Renamed:
      return <VscDiffRenamed />;
    default:
      return <VscDiffModified />;
  }
}
