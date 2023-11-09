import ErrorMsg from "@components/ErrorMsg";
import {
  PullDetailCommitFragment,
  PullDetailSummaryFragment,
  PullDetailsFragment,
} from "@gen/graphql-types";
import { PullDiffParams } from "@lib/params";
import PullCommit from "../PullCommit";
import PullCommitSummary from "../PullCommitSummary";
import css from "./index.module.css";

type Props = {
  params: PullDiffParams;
};

type InnerProps = Props & {
  pullDetails: PullDetailsFragment;
};

export default function PullDetailsList({ pullDetails, params }: InnerProps) {
  return pullDetails.details?.length ? (
    <ul className={css.list}>
      <div className={css.verticalLine} />
      {pullDetails.details.map(c => (
        <>
          <div className={css.verticalLine} />{" "}
          <ListItem params={params} key={c._id} item={c} />
        </>
      ))}
      <div className={css.verticalLine} />
    </ul>
  ) : (
    <p className={css.empty}>Branches are up to date. No details to display.</p>
  );
}

type PullDetail = PullDetailCommitFragment | PullDetailSummaryFragment;

type ListItemProps = {
  item: PullDetail;
  params: PullDiffParams;
};

function ListItem({ item, params }: ListItemProps) {
  switch (item.__typename) {
    case "PullDetailCommit":
      return <PullCommit params={params} commit={item} />;
    case "PullDetailSummary":
      return <PullCommitSummary summary={item} />;
    default:
      return (
        <ErrorMsg errString={`Invalid pull details type: ${item.__typename}`} />
      );
  }
}
