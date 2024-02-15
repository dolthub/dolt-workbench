import Button from "@components/Button";
import Modal from "@components/Modal";
import { Loader } from "@dolthub/react-components";
import {
  DatabasesDocument,
  useCreateDatabaseMutation,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { database } from "@lib/urls";
import { AiOutlinePlus } from "@react-icons/all-files/ai/AiOutlinePlus";
import cx from "classnames";
import { useRouter } from "next/router";
import { SyntheticEvent, useState } from "react";
import InnerModal from "./InnerModal";
import css from "./index.module.css";

type Props = {
  buttonClassName?: string;
};

export default function CreateDatabase(props: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [databaseName, setDatabaseName] = useState("");

  const { mutateFn: createDB, ...res } = useMutation({
    hook: useCreateDatabaseMutation,
    refetchQueries: [{ query: DatabasesDocument }],
  });

  const onClose = () => {
    setIsOpen(false);
    res.setErr(undefined);
    setDatabaseName("");
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const params = { databaseName };
    const { errors } = await createDB({ variables: params });
    if (errors?.length) return;
    const { href, as } = database(params);
    router.push(href, as).catch(console.error);
  };

  return (
    <div>
      <Loader loaded={!res.loading} />
      <Button.Link
        onClick={() => setIsOpen(true)}
        data-cy="add-database-button"
        className={cx(css.createDB, props.buttonClassName)}
      >
        <AiOutlinePlus /> Create database
      </Button.Link>
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        title="Create new database"
        className={css.modal}
      >
        <InnerModal
          {...props}
          onClose={onClose}
          onSubmit={onSubmit}
          databaseName={databaseName}
          setDatabaseName={setDatabaseName}
          err={res.err}
        />
      </Modal>
    </div>
  );
}
