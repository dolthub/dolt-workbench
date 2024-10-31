import Link from "@components/links/Link";
import { Button, Loader, Modal } from "@dolthub/react-components";
import { StatusFragment, useRestoreAllMutation } from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import useSqlBuilder from "@hooks/useSqlBuilder";
import { ModalProps } from "@lib/modalProps";
import { RefParams } from "@lib/params";
import { getPostgresTableName } from "@lib/postgres";
import { refetchSqlUpdateQueriesCacheEvict } from "@lib/refetchQueries";
import { sqlQuery } from "@lib/urls";
import css from "./index.module.css";

type Props = ModalProps & {
  params: RefParams;
  status: StatusFragment[];
  forDiffPage?: boolean;
};

export default function ResetModal(props: Props) {
  const { getCallProcedure, isPostgres } = useSqlBuilder();
  const { mutateFn, loading, err, client } = useMutation({
    hook: useRestoreAllMutation,
  });

  const onRestoreAll = async () => {
    try {
      await mutateFn({ variables: props.params });
      props.setIsOpen(false);
      client
        .refetchQueries(refetchSqlUpdateQueriesCacheEvict)
        .catch(console.error);
    } catch (_) {
      // Handled by useMutation
    }
  };

  const getTableName = (tn: string): string => {
    if (isPostgres) {
      return getPostgresTableName(tn);
    }
    return tn;
  };

  const onClose = () => {
    props.setIsOpen(false);
  };

  return (
    <Modal
      title="Reset uncommitted changes"
      isOpen={props.isOpen}
      onRequestClose={onClose}
      button={
        <Button onClick={onRestoreAll} pill>
          Restore all tables
        </Button>
      }
      err={err}
    >
      <div>
        <Loader loaded={!loading} />
        <p>
          Choose to unstage staged tables or restore tables to their current
          contents in the current <code>HEAD</code>.
        </p>
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
                    <Link
                      {...sqlQuery({
                        ...props.params,
                        q: getCallProcedure("DOLT_RESET", [
                          getTableName(st.tableName),
                        ]),
                      })}
                    >
                      Unstage
                    </Link>
                  ) : (
                    <Link
                      {...sqlQuery({
                        ...props.params,
                        q: getCallProcedure("DOLT_CHECKOUT", [
                          getTableName(st.tableName),
                        ]),
                      })}
                    >
                      Restore
                    </Link>
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
