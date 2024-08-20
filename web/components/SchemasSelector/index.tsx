import CreateDatabaseOrSchema from "@components/CreateDatabaseOrSchema";
import { FormSelect } from "@dolthub/react-components";
import { Maybe } from "@dolthub/web-utils";
import {
  DatabasesDocument,
  useCreateSchemaMutation,
  useDatabaseSchemasQuery,
  useTableNamesForBranchLazyQuery,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { RefMaybeSchemaParams } from "@lib/params";
import { RefUrl, ref } from "@lib/urls";
import { useRouter } from "next/router";
import css from "./index.module.css";

type Props = {
  params: RefMaybeSchemaParams & { tableName?: string };
  routeRefChangeTo: RefUrl;
};

type InnerProps = Props & {
  schemas: string[];
};

function Inner(props: InnerProps) {
  const { mutateFn: createSchema, ...res } = useMutation({
    hook: useCreateSchemaMutation,
    refetchQueries: [{ query: DatabasesDocument }],
  });
  const router = useRouter();
  const [getTableNames] = useTableNamesForBranchLazyQuery();

  const handleChangeRef = async (schemaName: Maybe<string>) => {
    if (!schemaName) return;
    const variables = {
      ...props.params,
      schemaName,
    };

    // If on a table page, check if the table exists on the new schema. If not,
    // route to ref.
    if (props.params.tableName) {
      const tableRes = await getTableNames({ variables });
      const tableExists = tableRes.data?.tableNames.list.some(
        t => t === props.params.tableName,
      );
      if (!tableExists) {
        const { href, as } = ref({ ...props.params, schemaName });
        router.push(href, as).catch(console.error);
        return;
      }
    }

    const { href, as } = props.routeRefChangeTo({
      ...props.params,
      schemaName,
    });

    router.push(href, as).catch(console.error);
  };

  return (
    <span className={css.wrapper}>
      <FormSelect
        val={props.params.schemaName ?? props.schemas[0]}
        onChangeValue={handleChangeRef}
        options={props.schemas.map(v => {
          return {
            value: v,
            label: v,
          };
        })}
        label="Schema"
        horizontal
        light
      />
      <CreateDatabaseOrSchema
        {...props}
        err={res.err}
        loading={res.loading}
        setErr={res.setErr}
        name="schema"
        create={async n => createSchema({ variables: { schemaName: n } })}
      />
    </span>
  );
}

export default function SchemasSelector(props: Props) {
  const res = useDatabaseSchemasQuery();
  if (res.loading || res.error || !res.data) return null;
  return <Inner {...props} schemas={res.data.schemas} />;
}
