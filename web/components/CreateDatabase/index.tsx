import CreateDatabaseOrSchema from "@components/CreateDatabaseOrSchema";
import {
  DatabasesDocument,
  useCreateDatabaseMutation,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";

type Props = {
  buttonClassName?: string;
};

export default function CreateDatabase(props: Props) {
  const { mutateFn: createDB, ...res } = useMutation({
    hook: useCreateDatabaseMutation,
    refetchQueries: [{ query: DatabasesDocument }],
  });
  return (
    <CreateDatabaseOrSchema
      {...props}
      err={res.err}
      loading={res.loading}
      setErr={res.setErr}
      name="database"
      create={async n => createDB({ variables: { databaseName: n } })}
    />
  );
}
