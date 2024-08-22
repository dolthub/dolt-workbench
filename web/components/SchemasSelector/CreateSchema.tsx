import CreateDatabaseOrSchemaModal from "@components/CreateDatabaseOrSchemaModal";
import { Button, Loader, ModalOuter, Tooltip } from "@dolthub/react-components";
import {
  DatabaseSchemasDocument,
  useCreateSchemaMutation,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { RefParams } from "@lib/params";
import { ref } from "@lib/urls";
import { IoAddOutline } from "@react-icons/all-files/io5/IoAddOutline";
import { useRouter } from "next/router";
import { SyntheticEvent, useState } from "react";
import css from "./index.module.css";

type Props = {
  params: RefParams;
};

export default function CreateSchema(props: Props) {
  const { mutateFn: createSchema, ...res } = useMutation({
    hook: useCreateSchemaMutation,
    refetchQueries: [
      { query: DatabaseSchemasDocument, variables: props.params },
    ],
  });
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [schemaName, setSchemaName] = useState("");

  const onClose = () => {
    setIsOpen(false);
    res.setErr(undefined);
    setSchemaName("");
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const { success } = await createSchema({
      variables: { schemaName, databaseName: props.params.databaseName },
    });
    if (!success) return;
    const { href, as } = ref({ ...props.params, schemaName });
    router.push(href, as).catch(console.error);
  };

  return (
    <div>
      <Loader loaded={!res.loading} />
      <Button.Link
        onClick={() => setIsOpen(true)}
        className={css.createSch}
        data-tooltip-id="create-schema"
        data-tooltip-content="Create new schema"
        data-tooltip-place="bottom"
      >
        <IoAddOutline />
      </Button.Link>
      <Tooltip id="create-schema" />
      <ModalOuter
        isOpen={isOpen}
        onRequestClose={onClose}
        title="Create new schema"
      >
        <CreateDatabaseOrSchemaModal
          {...props}
          onClose={onClose}
          onSubmit={onSubmit}
          name={schemaName}
          setName={setSchemaName}
          err={res.err}
          label="schema"
        />
      </ModalOuter>
    </div>
  );
}
