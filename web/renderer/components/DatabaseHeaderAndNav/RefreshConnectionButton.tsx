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
import { useRouter } from "next/router";

export default function ResetConnectionButton() {
  const { mutateFn, loading, err, setErr, client } = useMutation({
    hook: useResetDatabaseMutation,
  });
  const router = useRouter();
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  const onClick = async () => {
    await mutateFn();
    await client.resetStore();
    router.reload();
  };

  const onClose = () => {
    setErrorModalOpen(false);
    setErr(undefined);
  };

  return (
    <>
      <Button.Link
        className={css.resetButton}
        onClick={onClick}
        data-tooltip-content="Refresh connection"
        data-tooltip-id="refresh-connection"
        data-cy="reset-button"
      >
        <SmallLoader
          loaded={!loading}
          options={{ color: "#fff", top: "0", opacity: 0.5, left: "-0.5rem" }}
        >
          <IoReloadSharp />
        </SmallLoader>
      </Button.Link>
      <Tooltip id="refresh-connection" className={css.tooltip} place="left" />
      <Modal
        isOpen={errorModalOpen}
        onRequestClose={onClose}
        title="Error refreshing connection"
      >
        <ErrorMsg err={err} />
      </Modal>
    </>
  );
}
