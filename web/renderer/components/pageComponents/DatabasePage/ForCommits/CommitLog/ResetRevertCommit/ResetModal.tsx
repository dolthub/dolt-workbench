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

export default function ResetModal(props: Props) {
  const { getCallProcedure } = useSqlBuilder();
  return (
    <Modal
      {...props}
      onRequestClose={() => props.setIsOpen(false)}
      title="Reset Commit"
      button={
        <Link
          {...sqlQuery({
            ...props.params,
            q: getCallProcedure("DOLT_RESET", [
              "--hard",
              props.commit.commitId,
            ]),
          })}
        >
          <Button>Reset commit</Button>
        </Link>
      }
    >
      <p>
        Resets the database to this commit. Learn more about reset{" "}
        <DocsLink path="/sql-reference/version-control/dolt-sql-procedures#dolt_reset">
          here
        </DocsLink>
        .
      </p>
      <p>Are you sure you would like to proceed?</p>
    </Modal>
  );
}
