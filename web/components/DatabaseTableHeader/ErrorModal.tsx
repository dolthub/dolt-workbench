import ErrorMsg from "@components/ErrorMsg";
import Modal from "@components/Modal";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button } from "@dolthub/react-components";
import { ModalProps } from "@lib/modalProps";
import css from "./index.module.css";

type Props = ModalProps;

export default function ErrorModal(props: Props) {
  const { error, setError } = useSqlEditorContext();

  const onClose = () => {
    props.setIsOpen(false);
    setError(undefined);
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onRequestClose={onClose}
      title="Query error"
      button={<Button onClick={onClose}>Got it</Button>}
    >
      <div data-cy="error-modal">
        <QueryError err={error} />
      </div>
    </Modal>
  );
}

function QueryError({ err }: { err?: Error }) {
  if (!err) {
    return (
      <p>There was an error executing the current query. Please try again.</p>
    );
  }
  return <ErrorMsg err={err} className={css.err} />;
}
