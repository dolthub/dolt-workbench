import Button from "@components/Button";
import Modal from "@components/Modal";
import { Loader } from "@dolthub/react-components";
import { DatabasesDocument, useCreateSchemaMutation } from "@gen/graphql-types";
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

export default function CreateSchema(props: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [schemaName, setSchemaName] = useState("");

  const { mutateFn: createSchema, ...res } = useMutation({
    hook: useCreateSchemaMutation,
    refetchQueries: [{ query: DatabasesDocument }],
  });

  const onClose = () => {
    setIsOpen(false);
    res.setErr(undefined);
    setSchemaName("");
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const params = { schemaName };
    const { errors } = await createSchema({ variables: params });
    if (errors?.length) return;
    const { href, as } = database({ databaseName: params.schemaName });
    router.push(href, as).catch(console.error);
  };

  return (
    <div>
      <Loader loaded={!res.loading} />
      <Button.Link
        onClick={() => setIsOpen(true)}
        data-cy="add-schema-button"
        className={cx(css.createSchema, props.buttonClassName)}
      >
        <AiOutlinePlus /> Create schema
      </Button.Link>
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        title="Create new schema"
        className={css.modal}
      >
        <InnerModal
          {...props}
          onClose={onClose}
          onSubmit={onSubmit}
          schemaName={schemaName}
          setSchemaName={setSchemaName}
          err={res.err}
        />
      </Modal>
    </div>
  );
}
