import CreateDatabaseOrSchemaModal from "@components/CreateDatabaseOrSchemaModal";
import { Button, Loader, ModalOuter } from "@dolthub/react-components";
import {
  DatabasesDocument,
  useCreateDatabaseMutation,
  useResetDatabaseMutation,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { database } from "@lib/urls";
import { AiOutlinePlusCircle } from "@react-icons/all-files/ai/AiOutlinePlusCircle";
import cx from "classnames";
import { useRouter } from "next/router";
import { SyntheticEvent, useState } from "react";
import css from "./index.module.css";

type Props = {
  buttonClassName?: string;
  isPostgres: boolean;
  showText?: boolean;
  isDolt?: boolean;
};

export default function CreateDatabase(props: Props) {
  const { mutateFn: createDB, ...res } = useMutation({
    hook: useCreateDatabaseMutation,
    refetchQueries: [{ query: DatabasesDocument }],
  });
  const { mutateFn: resetDB, ...resetRes } = useMutation({
    hook: useResetDatabaseMutation,
  });
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [databaseName, setDatabaseName] = useState("");

  const onClose = () => {
    setIsOpen(false);
    res.setErr(undefined);
    setDatabaseName("");
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const { success } = await createDB({ variables: { databaseName } });
    if (!success) return;
    if (props.isPostgres) {
      await resetDB({ variables: { newDatabase: databaseName } });
    }
    const { href, as } = database({ databaseName });
    router.push(href, as).catch(console.error);
  };

  return (
    <div>
      <Loader loaded={!res.loading && !resetRes.loading} />
      <Button.Link
        onClick={() => setIsOpen(true)}
        className={cx(css.createDB, props.buttonClassName)}
        data-cy="add-database-button"
      >
        {props.showText ? (
          <span className={css.text}>Create Database</span>
        ) : (
          <AiOutlinePlusCircle />
        )}
      </Button.Link>
      <ModalOuter
        isOpen={isOpen}
        onRequestClose={onClose}
        title="Create new database"
      >
        <CreateDatabaseOrSchemaModal
          {...props}
          onClose={onClose}
          onSubmit={onSubmit}
          name={databaseName}
          setName={setDatabaseName}
          err={res.err ?? resetRes.err}
          label="database"
        />
      </ModalOuter>
    </div>
  );
}
