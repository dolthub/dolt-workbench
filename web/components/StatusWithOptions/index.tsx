import Button from "@components/Button";
import Tooltip from "@components/Tooltip";
import Link from "@components/links/Link";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { Loader } from "@dolthub/react-components";
import { StatusFragment, useGetStatusQuery } from "@gen/graphql-types";
import useRole from "@hooks/useRole";
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
  const { canWriteToDB } = useRole();

  return (
    <div
      className={cx(
        css.uncommitted,
        {
          [css.smallMinWidth]: props.forDiffPage || !canWriteToDB,
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
      <HideForNoWritesWrapper params={props.params}>
        <>
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
          <ResetModal
            {...props}
            isOpen={resetIsOpen}
            setIsOpen={setResetIsOpen}
          />
          <CommitModal
            {...props}
            isOpen={commitIsOpen}
            setIsOpen={setCommitIsOpen}
          />
        </>
      </HideForNoWritesWrapper>
    </div>
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
