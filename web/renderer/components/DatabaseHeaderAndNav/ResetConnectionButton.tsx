import {
  Button,
  ErrorMsg,
  Modal,
  SmallLoader,
  Tooltip,
} from "@dolthub/react-components";
import { useResetDatabaseMutation } from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { IoReloadSharp } from "@react-icons/all-files/io5/IoReloadSharp";
import { useState } from "react";
import css from "./index.module.css";

export default function ResetConnectionButton() {
  const { mutateFn, loading, err, setErr } = useMutation({
    hook: useResetDatabaseMutation,
  });
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  const onClose = () => {
    setErrorModalOpen(false);
    setErr(undefined);
  };

  return (
    <>
      <Button.Link
        className={css.resetButton}
        onClick={async () => mutateFn()}
        data-tooltip-content="Reset connection"
        data-tooltip-id="reset-connection"
      >
        <SmallLoader
          loaded={!loading}
          options={{ color: "#fff", top: "0", opacity: 0.5, left: "-0.5rem" }}
        >
          <IoReloadSharp />
        </SmallLoader>
      </Button.Link>
      <Tooltip id="reset-connection" className={css.tooltip} />
      <Modal
        isOpen={errorModalOpen}
        onRequestClose={onClose}
        title="Error resetting connection"
      >
        <ErrorMsg err={err} />
      </Modal>
    </>
  );
}
