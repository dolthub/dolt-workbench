import Modal from "@components/Modal";
import Link from "@components/links/Link";
import { Button } from "@dolthub/react-components";
import { StatusFragment } from "@gen/graphql-types";
import { ModalProps } from "@lib/modalProps";
import { RefParams } from "@lib/params";
import { sqlQuery } from "@lib/urls";
import css from "./index.module.css";

type Props = ModalProps & {
  params: RefParams;
  status: StatusFragment[];
  forDiffPage?: boolean;
};

export default function ResetModal(props: Props) {
  const onClose = () => {
    props.setIsOpen(false);
  };

  return (
    <Modal
      title="Reset Uncommitted Changes"
      isOpen={props.isOpen}
      onRequestClose={onClose}
      className={css.resetModal}
    >
      <div>
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
                        q: `CALL DOLT_RESET("${st.tableName}")`,
                      })}
                    >
                      Unstage
                    </Link>
                  ) : (
                    <Link
                      {...sqlQuery({
                        ...props.params,
                        q: `CALL DOLT_CHECKOUT("${st.tableName}")`,
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
        <Button onClick={onClose}>Done</Button>
      </div>
    </Modal>
  );
}
