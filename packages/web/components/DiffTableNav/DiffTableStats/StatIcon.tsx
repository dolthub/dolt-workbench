import { TableDiffType } from "@gen/graphql-types";
import { GoDiffAdded } from "@react-icons/all-files/go/GoDiffAdded";
import { GoDiffModified } from "@react-icons/all-files/go/GoDiffModified";
import { GoDiffRemoved } from "@react-icons/all-files/go/GoDiffRemoved";
import { GoDiffRenamed } from "@react-icons/all-files/go/GoDiffRenamed";

type Props = {
  tableType: TableDiffType;
};

export default function StatIcon({ tableType }: Props) {
  switch (tableType) {
    case TableDiffType.Added:
      return <GoDiffAdded />;
    case TableDiffType.Dropped:
      return <GoDiffRemoved />;
    case TableDiffType.Renamed:
      return <GoDiffRenamed />;
    default:
      return <GoDiffModified />;
  }
}
