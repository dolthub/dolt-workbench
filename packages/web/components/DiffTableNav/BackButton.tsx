import Button from "@components/Button";
import Loader from "@components/Loader";
import CommitLogLink from "@components/links/CommitLogLink";
import useDefaultBranch from "@hooks/useDefaultBranch";
import { DatabaseParams } from "@lib/params";
import { FaChevronLeft } from "@react-icons/all-files/fa/FaChevronLeft";
import cx from "classnames";
import css from "./index.module.css";

type Params = DatabaseParams & {
  refName?: string;
};

type Props = {
  params: Params;
  open: boolean;
  forPull?: boolean;
};

export default function BackButton(props: Props) {
  const { defaultBranchName, loading } = useDefaultBranch(props.params);
  if (props.forPull) return <div />;
  return (
    <div
      className={cx(css.backButton, props.open ? css.openItem : css.closedItem)}
      data-cy="back-to-commits"
    >
      <Loader loaded={!loading} />

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
    </div>
  );
}
