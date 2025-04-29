import DocsLink from "@components/links/DocsLink";
import Link from "@components/links/Link";
import { Button, Modal } from "@dolthub/react-components";
import { CommitForHistoryFragment } from "@gen/graphql-types";
import useSqlBuilder from "@hooks/useSqlBuilder";
import { ModalProps } from "@lib/modalProps";
import { RefParams } from "@lib/params";
import { sqlQuery } from "@lib/urls";

type Props = ModalProps & {
  commit: CommitForHistoryFragment;
  params: RefParams;
};

export default function RevertModal(props: Props) {
  const { getCallProcedure } = useSqlBuilder();
  return (
    <Modal
      {...props}
      onRequestClose={() => props.setIsOpen(false)}
      title="Revert Commit"
      button={
        <Link
          {...sqlQuery({
            ...props.params,
            q: getCallProcedure("DOLT_REVERT", [props.commit.commitId]),
          })}
        >
          <Button>Revert commit</Button>
        </Link>
      }
    >
      <p>
        Reverts the changes introduced in this commit by creating a new commit
        from the current HEAD that reverses the changes in this commit. Learn
        more about revert{" "}
        <DocsLink path="/sql-reference/version-control/dolt-sql-procedures#dolt_revert">
          here
        </DocsLink>
        .
      </p>
      <p>Are you sure you would like to proceed?</p>
    </Modal>
  );
}
