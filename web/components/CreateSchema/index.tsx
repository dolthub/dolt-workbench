import CreateDatabaseOrSchema from "@components/CreateDatabaseOrSchema";
import { DatabasesDocument, useCreateSchemaMutation } from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";

type Props = {
  buttonClassName?: string;
};

export default function CreateSchema(props: Props) {
  const { mutateFn: createSchema, ...res } = useMutation({
    hook: useCreateSchemaMutation,
    refetchQueries: [{ query: DatabasesDocument }],
  });
  return (
    <CreateDatabaseOrSchema
      {...props}
      err={res.err}
      loading={res.loading}
      setErr={res.setErr}
      name="schema"
      create={async n => createSchema({ variables: { schemaName: n } })}
    />
  );
}
