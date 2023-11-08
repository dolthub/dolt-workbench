import Button from "@components/Button";
import PullStateLabel from "@components/PullStateLabel";
import PullsBreadcrumbs from "@components/breadcrumbs/PullsBreadcrumbs";
import Link from "@components/links/Link";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import QueryHandler from "@components/util/QueryHandler";
import {
  PullState,
  usePullDetailsForPullDetailsQuery,
} from "@gen/graphql-types";
import { PullDiffParams, PullParams } from "@lib/params";
import { pullDiff, pulls } from "@lib/urls";
import { useEffect, useState } from "react";
import ForDefaultBranch from "../ForDefaultBranch";
import BranchSelectForm from "./BranchSelectForm";
import PullDetailsList from "./PullDetailsList";
import css from "./index.module.css";

type Props = {
  params: PullParams;
};

type BranchesProps = {
  params: PullDiffParams;
  setPullState: (s: PullState) => void;
};

function ForBranches(props: BranchesProps) {
  const res = usePullDetailsForPullDetailsQuery({ variables: props.params });

  console.log(res);

  useEffect(() => {
    if (!res.data) return;
    props.setPullState(res.data.pullWithDetails.state);
  });

  return (
    <QueryHandler
      result={res}
      render={data => (
        <PullDetailsList
          params={props.params}
          pullDetails={data.pullWithDetails}
        />
      )}
    />
  );
}

function Inner(props: Props) {
  const [pullState, setPullState] = useState<PullState | undefined>();
  return (
    <div>
      <div className={css.top}>
        <BranchSelectForm params={props.params} />
        <div>
          <PullStateLabel state={pullState} />
          {props.params.fromBranchName && props.params.toBranchName && (
            <Link
              {...pullDiff({
                ...props.params,
                fromBranchName: props.params.fromBranchName,
                toBranchName: props.params.toBranchName,
              })}
            >
              <Button>View Diff</Button>
            </Link>
          )}
        </div>
      </div>

      {props.params.fromBranchName && props.params.toBranchName ? (
        <ForBranches
          params={{
            ...props.params,
            fromBranchName: props.params.fromBranchName,
            toBranchName: props.params.toBranchName,
          }}
          setPullState={setPullState}
        />
      ) : (
        <p>Select branches</p>
      )}
    </div>
  );
}

export default function ForPulls(props: Props) {
  return (
    <ForDefaultBranch
      initialTabIndex={4}
      params={props.params}
      routeRefChangeTo={pulls}
      title="pulls"
      smallHeaderBreadcrumbs={<PullsBreadcrumbs params={props.params} />}
      hideDefaultTable
    >
      <NotDoltWrapper showNotDoltMsg feature="Viewing pull requests" bigMsg>
        <Inner {...props} />
      </NotDoltWrapper>
    </ForDefaultBranch>
  );
}
