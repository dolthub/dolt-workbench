import { useApolloClient } from "@apollo/client";
import DocsLink from "@components/links/DocsLink";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { FormInput, FormModal, Loader } from "@dolthub/react-components";
import { useCreateViewMutation } from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { ModalProps } from "@lib/modalProps";
import { OptionalRefParams } from "@lib/params";
import { refetchUpdateDatabaseQueriesCacheEvict } from "@lib/refetchQueries";
import dynamic from "next/dynamic";
import { SyntheticEvent, useState } from "react";
import css from "./index.module.css";

const AceEditor = dynamic(async () => import("@components/AceEditor"), {
  ssr: false,
});

type Props = {
  params: OptionalRefParams;
  query: string;
} & ModalProps;

export default function CreateViewModal({
  setIsOpen,
  ...props
}: Props): JSX.Element {
  const { setExecutedQuery, setError, setExecutionMessage, error } =
    useSqlEditorContext("Views");
  const { mutateFn: createView, loading } = useMutation({
    hook: useCreateViewMutation,
  });
  const client = useApolloClient();
  const [name, setName] = useState("your_name_here");

  const onClose = () => {
    setIsOpen(false);
  };

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!props.params.refName) {
      setError(new Error("Cannot create view without ref"));
      return;
    }
    const res = await createView({
      variables: {
        databaseName: props.params.databaseName,
        refName: props.params.refName,
        name,
        queryString: props.query,
      },
    });
    if (res.success && res.data?.createView) {
      setExecutedQuery(res.data.createView.queryString, { isMutation: true });
      setExecutionMessage(res.data.createView.executionMessage);
      client
        .refetchQueries(refetchUpdateDatabaseQueriesCacheEvict)
        .catch(console.error);
      setIsOpen(false);
    } else if (res.error) {
      setError(res.error);
    }
  };

  return (
    <FormModal
      onSubmit={onSubmit}
      isOpen={props.isOpen}
      onRequestClose={onClose}
      title="Create view"
      disabled={!name}
      btnText="Create"
      err={error}
    >
      <Loader loaded={!loading} />
      <p>
        Learn more about views{" "}
        <DocsLink systemTableType="schemas">here</DocsLink>.
      </p>
      <div className={css.query}>
        <div className={css.label}>Query</div>
        <AceEditor
          value={props.query}
          name="AceViewer"
          fontSize={13}
          readOnly
          wrapEnabled
          showGutter={false}
          maxLines={6}
          light
        />
      </div>
      <FormInput
        label="Name"
        placeholder="Name your view"
        value={name}
        onChangeString={setName}
        data-cy="query-name"
        light
      />
    </FormModal>
  );
}
