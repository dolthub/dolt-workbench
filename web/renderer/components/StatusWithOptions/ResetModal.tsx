import { Button, Loader, Modal } from "@dolthub/react-components";
import { StatusFragment, useRestoreAllMutation } from "@gen/graphql-types";
import useCallProcedure from "@hooks/useCallProcedure";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import useMutation from "@hooks/useMutation";
import { ModalProps } from "@lib/modalProps";
import { RefParams } from "@lib/params";
import { getPostgresTableName } from "@lib/postgres";
import { refetchUpdateDatabaseQueriesCacheEvict } from "@lib/refetchQueries";
import css from "./index.module.css";

type Props = ModalProps & {
  params: RefParams;
  status: StatusFragment[];
  mode?: "all" | "staged" | "working";
};

export default function ResetModal(props: Props) {
  const { isPostgres } = useDatabaseDetails();
  const { callProcedure, loading: callLoading } = useCallProcedure(
    props.params,
  );
  const { mutateFn, loading, err, client } = useMutation({
    hook: useRestoreAllMutation,
  });

  const getTableName = (tn: string): string =>
    isPostgres ? getPostgresTableName(tn) : tn;

  const onResetAll = async () => {
    if (props.mode && props.mode !== "all") {
      const procedure =
        props.mode === "staged" ? "DOLT_RESET" : "DOLT_CHECKOUT";
      const tableNames = [
        ...new Set(props.status.map(st => getTableName(st.tableName))),
      ];
      const { success } = await callProcedure(procedure, tableNames);
      if (success) props.setIsOpen(false);
      return;
    }

    try {
      await mutateFn({ variables: props.params });
      props.setIsOpen(false);
      client
        .refetchQueries(refetchUpdateDatabaseQueriesCacheEvict)
        .catch(console.error);
    } catch {
      // Handled by useMutation
    }
  };

  const onPerRow = async (proc: "DOLT_RESET" | "DOLT_CHECKOUT", tn: string) => {
    const { success } = await callProcedure(proc, [getTableName(tn)]);
    if (success) props.setIsOpen(false);
  };

  const renderInstructions = () => {
    if (props.mode === "working") {
      return (
        <p>
          Choose tables whose unstaged changes you want to discard. Staged
          changes will be preserved.
        </p>
      );
    }
    if (props.mode === "staged") {
      return (
        <p>Choose staged tables to move their changes to the working set.</p>
      );
    }
    return (
      <p>
        Choose to unstage staged tables or restore tables to their current
        contents in the current <code>HEAD</code>.
      </p>
    );
  };

  return (
    <Modal
      title={
        props.mode === "staged"
          ? "Reset staged changes"
          : "Reset uncommitted changes"
      }
      isOpen={props.isOpen}
      onRequestClose={() => props.setIsOpen(false)}
      button={
        <Button onClick={onResetAll} pill>
          {props.mode === "staged"
            ? "Unstage all tables"
            : "Restore all tables"}
        </Button>
      }
      err={err}
    >
      <div>
        <Loader loaded={!loading && !callLoading} />
        {renderInstructions()}
        <table className={css.resetTable}>
          <thead>
            <tr>
              <th>Table name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {props.status.map(st => (
              <tr key={st._id}>
                <td>{st.tableName}</td>
                <td>{st.status}</td>
                <td>
                  {st.staged ? (
                    <Button.Link
                      onClick={async () => onPerRow("DOLT_RESET", st.tableName)}
                      disabled={callLoading}
                    >
                      Unstage
                    </Button.Link>
                  ) : (
                    <Button.Link
                      onClick={async () =>
                        onPerRow("DOLT_CHECKOUT", st.tableName)
                      }
                      disabled={callLoading}
                    >
                      Restore
                    </Button.Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
