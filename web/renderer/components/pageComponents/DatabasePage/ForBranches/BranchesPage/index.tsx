import { Database404 } from "@components/Database404";
import DeleteModal from "@components/DeleteModal";
import Link from "@components/links/Link";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import {
  Button,
  FormSelect,
  Loader,
  QueryHandler,
} from "@dolthub/react-components";
import { Maybe } from "@dolthub/web-utils";
import {
  BranchFragment,
  SortBranchesBy,
  useDeleteBranchMutation,
} from "@gen/graphql-types";
import { BsArrowLeft } from "@react-icons/all-files/bs/BsArrowLeft";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { gqlDepNotFound } from "@lib/errors/graphql";
import { errorMatches } from "@lib/errors/helpers";
import { OptionalRefParams } from "@lib/params";
import { refetchBranchQueries } from "@lib/refetchQueries";
import { diff, newBranch } from "@lib/urls";
import { useState } from "react";
import BranchList from "./BranchList";
import { useBranchList } from "./useBranchList";
import BranchSelect from "../../ForPulls/BranchSelectForm/BranchSelect";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams;
};

type InnerProps = {
  branches: BranchFragment[];
  loadMore: () => Promise<void>;
  hasMore: boolean;
  sortBranches: (sortBy: Maybe<SortBranchesBy>) => Promise<void>;
  sortBy: Maybe<SortBranchesBy>;
} & Props;

function Inner(props: InnerProps): JSX.Element {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [branchNameToDelete, setBranchNameToDelete] = useState("");
  const [fromBranch, setFromBranch] = useState("");
  const [toBranch, setToBranch] = useState("");

  const createUrl = newBranch({
    ...props.params,
    refName:
      branchNameToDelete === props.params.refName
        ? undefined
        : props.params.refName,
  });

  const onDeleteClicked = (branch: BranchFragment) => {
    setBranchNameToDelete(branch.branchName);
    setDeleteModalOpen(true);
  };

  return (
    <div className={css.container}>
      <div className={css.top}>
        <h1>Branches</h1>
        <div className={css.topRight}>
          <FormSelect
            className={css.sortSelect}
            val={props.sortBy}
            onChangeValue={props.sortBranches}
            options={[
              {
                value: SortBranchesBy.LastUpdated,
                label: "sort by last updated",
              },
            ]}
            placeholder="sort by default"
            isClearable
            horizontal
          />
          <HideForNoWritesWrapper params={props.params}>
            <Link {...createUrl} className={css.white}>
              <Button>Create Branch</Button>
            </Link>
          </HideForNoWritesWrapper>
        </div>
      </div>
      <div>
        {props.branches.length ? (
          <div className={css.outer}>
            <form>
              <div className={css.selectors}>
                <BranchSelect
                  branchList={props.branches}
                  currentBranchName={toBranch}
                  label="to branch"
                  onChange={b => {
                    setToBranch(b || "");
                  }}
                />
                <div className={css.arrow}>
                  <BsArrowLeft />
                </div>

                <BranchSelect
                  branchList={props.branches}
                  currentBranchName={fromBranch}
                  label="from branch"
                  onChange={b => {
                    setFromBranch(b || "");
                  }}
                />
                {fromBranch && toBranch && fromBranch !== toBranch && (
                  <Link
                    {...diff({
                      ...props.params,
                      refName: props.params.refName || "",
                      fromCommitId: fromBranch,
                      toCommitId: toBranch,
                    })}
                    className={css.viewDiffButton}
                  >
                    <Button>
                      View Diff <FaChevronRight />
                    </Button>
                  </Link>
                )}
              </div>
            </form>

            <BranchList {...props} onDeleteClicked={onDeleteClicked} />
          </div>
        ) : (
          <p className={css.noBranches}>No branches found</p>
        )}
        <DeleteModal
          isOpen={isDeleteModalOpen}
          setIsOpen={setDeleteModalOpen}
          asset="branch"
          assetId={branchNameToDelete}
          mutationProps={{
            hook: useDeleteBranchMutation,
            variables: { ...props.params, branchName: branchNameToDelete },
            refetchQueries: refetchBranchQueries(props.params),
          }}
          cannotBeUndone
        />
      </div>
    </div>
  );
}

export default function BranchesPage({ params }: Props): JSX.Element {
  const res = useBranchList(params);
  if (res.loading) return <Loader loaded={false} />;
  if (errorMatches(gqlDepNotFound, res.error)) {
    return <Database404 params={params} />;
  }

  return (
    <QueryHandler
      result={{ ...res, data: res.branches }}
      render={data => (
        <Inner
          params={params}
          branches={data}
          loadMore={res.loadMore}
          hasMore={res.hasMore}
          sortBranches={res.sortBranches}
          sortBy={res.sortBy}
        />
      )}
    />
  );
}
