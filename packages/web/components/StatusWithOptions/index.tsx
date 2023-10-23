import Button from "@components/Button";
import Loader from "@components/Loader";
import Tooltip from "@components/Tooltip";
import Link from "@components/links/Link";
import { StatusFragment, useGetStatusQuery } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { diff } from "@lib/urls";
import { IoArrowUndoOutline } from "@react-icons/all-files/io5/IoArrowUndoOutline";
import cx from "classnames";
import { useState } from "react";
import CommitModal from "./CommitModal";
import ResetModal from "./ResetModal";
import css from "./index.module.css";

type Props = {
  params: RefParams;
  forDiffPage?: boolean;
  className?: string;
};

type InnerProps = Props & {
  status: StatusFragment[];
};

function Inner(props: InnerProps) {
  const [commitIsOpen, setCommitIsOpen] = useState(false);
  const [resetIsOpen, setResetIsOpen] = useState(false);

  return (
    <>
      <div
        className={cx(
          css.uncommitted,
          {
            [css.smallMinWidth]: props.forDiffPage,
          },
          props.className,
        )}
        data-cy="uncommitted-changes"
      >
        {!props.forDiffPage && (
          <Link
            {...diff({
              ...props.params,
              toCommitId: "WORKING",
              fromCommitId: "HEAD",
            })}
          >
            Uncommitted changes.
          </Link>
        )}
        <Button.Outlined
          onClick={() => setCommitIsOpen(true)}
          className={css.commitButton}
        >
          Create commit
        </Button.Outlined>
        <Button.Link
          onClick={() => setResetIsOpen(true)}
          className={css.resetButton}
          data-tooltip-id="reset-changes"
          data-tooltip-content="Reset uncommitted changes"
        >
          <IoArrowUndoOutline />
          <Tooltip id="reset-changes" />
        </Button.Link>
      </div>
      <ResetModal {...props} isOpen={resetIsOpen} setIsOpen={setResetIsOpen} />
      <CommitModal
        {...props}
        isOpen={commitIsOpen}
        setIsOpen={setCommitIsOpen}
      />
    </>
  );
}

export default function StatusWithOptions(props: Props) {
  const res = useGetStatusQuery({ variables: props.params });
  if (res.loading) return <Loader loaded={false} />;
  if (res.error || !res.data || res.data.status.length === 0) {
    return null;
  }
  return <Inner {...props} status={res.data.status} />;
}
