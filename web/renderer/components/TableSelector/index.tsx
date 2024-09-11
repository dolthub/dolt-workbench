import { FormSelect, QueryHandler } from "@dolthub/react-components";
import { Maybe } from "@dolthub/web-utils";
import { useTableNamesQuery } from "@gen/graphql-types";
import { RefOptionalSchemaParams } from "@lib/params";

type Props = {
  params: RefOptionalSchemaParams;
  onChangeTable: (t: Maybe<string>) => void;
  selectedTable: string;
  light?: boolean;
};

type InnerProps = Props & {
  tables: string[];
};

function Inner(props: InnerProps) {
  return (
    <div data-cy="table-selector">
      {props.tables.length ? (
        <FormSelect
          {...props}
          onChangeValue={props.onChangeTable}
          val={props.selectedTable || ""}
          options={props.tables.map(t => {
            return {
              value: t,
              label: t,
            };
          })}
          hideSelectedOptions
          isClearable
        />
      ) : (
        <p>No tables found</p>
      )}
    </div>
  );
}

export default function TableSelector(props: Props) {
  const res = useTableNamesQuery({
    variables: { ...props.params, filterSystemTables: true },
  });
  return (
    <QueryHandler
      result={res}
      render={data => <Inner {...props} tables={data.tableNames.list} />}
    />
  );
}
