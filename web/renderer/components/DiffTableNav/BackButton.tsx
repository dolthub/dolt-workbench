import CommitLogLink from "@components/links/CommitLogLink";
import PullLink from "@components/links/PullLink";
import { Button, Loader } from "@dolthub/react-components";
import useDefaultBranch from "@hooks/useDefaultBranch";
import { DatabaseParams } from "@lib/params";
import { FaChevronLeft } from "@react-icons/all-files/fa/FaChevronLeft";
import cx from "classnames";
import css from "./index.module.css";

type Params = DatabaseParams & {
  refName?: string;
  fromBranchName?: string;
  toBranchName?: string;
};

type Props = {
  params: Params;
  open: boolean;
  forPull?: boolean;
};

export default function BackButton(props: Props) {
  const { defaultBranchName, loading } = useDefaultBranch(props.params);
  return (
    <div
      className={cx(
        css.backButton,
        css[props.open ? "openItem" : "closedItem"],
      )}
      data-cy={`back-to-${props.forPull ? "pull" : "commits"}`}
    >
      <Loader loaded={!loading} />
      {props.forPull ? (
        <PullLink params={props.params}>
          <Button>
            <FaChevronLeft className={css.chevron} /> Back to Pull Request
          </Button>
        </PullLink>
      ) : (
        <CommitLogLink
          params={{
            ...props.params,
            refName: props.params.refName ?? defaultBranchName,
          }}
        >
          <Button>
            <FaChevronLeft className={css.chevron} /> Back to Commit Log
          </Button>
        </CommitLogLink>
      )}
    </div>
  );
}
