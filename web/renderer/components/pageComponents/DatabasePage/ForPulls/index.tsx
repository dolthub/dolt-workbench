import PullStateLabel from "@components/PullStateLabel";
import PullsBreadcrumbs from "@components/breadcrumbs/PullsBreadcrumbs";
import Link from "@components/links/Link";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { Button, QueryHandler } from "@dolthub/react-components";
import {
  PullState,
  usePullDetailsForPullDetailsQuery,
} from "@gen/graphql-types";
import { PullDiffParams, PullParams } from "@lib/params";
import { pullDiff, pulls } from "@lib/urls";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { useEffect, useState } from "react";
import ForDefaultBranch from "../ForDefaultBranch";
import BranchSelectForm from "./BranchSelectForm";
import PullActions from "./PullActions";
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
  const res = usePullDetailsForPullDetailsQuery({
    variables: { ...props.params, toBranchName: props.params.refName },
  });

  useEffect(() => {
    if (!res.data) return;
    props.setPullState(res.data.pullWithDetails.state);
  });

  return (
    <QueryHandler
      result={res}
      render={data => (
        <div className={css.inner}>
          <PullDetailsList
            params={props.params}
            pullDetails={data.pullWithDetails}
          />
          <PullActions
            params={props.params}
            pullDetails={data.pullWithDetails}
          />
        </div>
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
          {props.params.fromBranchName &&
            props.params.refName &&
            pullState === PullState.Open && (
              <Link
                {...pullDiff({
                  ...props.params,
                  refName: props.params.refName,
                  fromBranchName: props.params.fromBranchName,
                })}
                className={css.viewDiffButton}
              >
                <Button>
                  View Diff <FaChevronRight />
                </Button>
              </Link>
            )}
        </div>
      </div>

      {props.params.fromBranchName && props.params.refName ? (
        <ForBranches
          params={{
            ...props.params,
            fromBranchName: props.params.fromBranchName,
            refName: props.params.refName,
          }}
          setPullState={setPullState}
        />
      ) : (
        <p className={css.selectBranches}>
          Select branches to view pull request
        </p>
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
      <NotDoltWrapper
        connectionName={props.params.connectionName}
        showNotDoltMsg
        feature="Viewing pull requests"
        bigMsg
      >
        <Inner {...props} />
      </NotDoltWrapper>
    </ForDefaultBranch>
  );
}
