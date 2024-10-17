import { FormSelect } from "@dolthub/react-components";
import { Maybe } from "@dolthub/web-utils";
import {
  useDatabaseSchemasQuery,
  useTableNamesForBranchLazyQuery,
} from "@gen/graphql-types";
import { RefOptionalSchemaParams } from "@lib/params";
import { RefUrl, ref } from "@lib/urls";
import { useRouter } from "next/router";
import CreateSchema from "./CreateSchema";
import css from "./index.module.css";

type Props = {
  params: RefOptionalSchemaParams & { tableName?: string };
  routeRefChangeTo: RefUrl;
};

type SelectorProps = {
  params: RefOptionalSchemaParams & { tableName?: string };
  val?: Maybe<string>;
  onChangeValue: (val: Maybe<string>) => void;
  horizontal?: boolean;
  className?: string;
};

export function Selector(props: SelectorProps) {
  const res = useDatabaseSchemasQuery({
    variables: props.params,
  });
  if (res.loading || res.error || !res.data) return null;

  return (
    <FormSelect
      val={props.val ?? res.data.schemas[0]}
      className={props.className}
      onChangeValue={props.onChangeValue}
      options={res.data.schemas.map(v => {
        return {
          value: v,
          label: v,
        };
      })}
      hideSelectedOptions
      label="Schema"
      horizontal={props.horizontal}
      light
    />
  );
}

export default function SchemasSelector(props: Props) {
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
      <Selector
        params={props.params}
        val={props.params.schemaName}
        onChangeValue={handleChangeRef}
        className={css.selector}
        horizontal
      />
      <CreateSchema {...props} />
    </span>
  );
}
