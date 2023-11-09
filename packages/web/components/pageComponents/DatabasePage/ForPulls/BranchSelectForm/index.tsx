import QueryHandler from "@components/util/QueryHandler";
import { BranchFragment, useBranchListQuery } from "@gen/graphql-types";
import { PullParams } from "@lib/params";
import { pulls } from "@lib/urls";
import { BsArrowLeft } from "@react-icons/all-files/bs/BsArrowLeft";
import { useRouter } from "next/router";
import BranchSelect from "./BranchSelect";
import css from "./index.module.css";

type Props = {
  params: PullParams;
};

type InnerProps = Props & {
  branches: BranchFragment[];
};

function Inner(props: InnerProps) {
  const router = useRouter();

  return (
    <div>
      {props.branches.length ? (
        <form>
          <div className={css.selectors}>
            <div data-cy="to-branch-selector">
              <BranchSelect
                branchList={props.branches}
                currentBranchName={props.params.refName ?? ""}
                label="Base branch"
                onChange={b => {
                  const p = pulls({ ...props.params, refName: b });
                  router.push(p.href, p.as).catch(console.error);
                }}
              />
            </div>
            <div className={css.arrow}>
              <BsArrowLeft />
            </div>
            <div data-cy="from-branch-selector">
              <BranchSelect
                branchList={props.branches}
                currentBranchName={props.params.fromBranchName ?? ""}
                label="From branch"
                onChange={b => {
                  const p = pulls({ ...props.params, fromBranchName: b });
                  router.push(p.href, p.as).catch(console.error);
                }}
              />
            </div>
          </div>
        </form>
      ) : (
        <span>Database must have branches to view pull request.</span>
      )}
    </div>
  );
}

export default function BranchSelectForm(props: Props) {
  const branchRes = useBranchListQuery({ variables: props.params });

  return (
    <QueryHandler
      result={branchRes}
      render={data => <Inner {...props} branches={data.branches.list} />}
    />
  );
}
