import { QueryHandler, SmallLoader } from "@dolthub/react-components";
import { SchemaType } from "@gen/graphql-types";
import useTableNames from "@hooks/useTableNames";
import { RefOptionalSchemaParams } from "@lib/params";
import List from "./List";
import css from "./index.module.css";

type Props = {
  params: RefOptionalSchemaParams & { q?: string };
};

export default function Tables(props: Props) {
  const res = useTableNames({
    databaseName: props.params.databaseName,
    refName: props.params.refName,
    schemaName: props.params.schemaName,
  });

  return (
    <QueryHandler
      result={{ ...res, data: res.tables }}
      loaderComponent={
        <SmallLoader.WithText
          text="Loading tables..."
          loaded={false}
          outerClassName={css.smallLoader}
        />
      }
      render={data => <List {...props} items={data} kind={SchemaType.Table} />}
    />
  );
}
