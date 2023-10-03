import Section from "@components/DatabaseTableNav/Section";
import SchemaDiagramButton from "@components/SchemaDiagramButton";
import QueryHandler from "@components/util/QueryHandler";
import useTableNames from "@hooks/useTableNames";
import { RefParams } from "@lib/params";
import { useEffect } from "react";
import Item from "./Item";
import css from "./index.module.css";
import { getActiveTable } from "./utils";

type Props = {
  params: RefParams & { q?: string };
};

type InnerProps = Props & {
  tables: string[];
};

function Inner(props: InnerProps) {
  const activeTable = getActiveTable(props.params.q);

  useEffect(() => {
    if (!activeTable) return;
    const el = document.getElementById(activeTable);
    el?.scrollIntoView();
  });

  return (
    <div data-cy="db-tables-schema-list">
      {props.tables.length ? (
        <>
          <ol>
            {props.tables.map(t => (
              <Item key={t} tableName={t} params={props.params} />
            ))}
          </ol>
          <SchemaDiagramButton {...props} />
        </>
      ) : (
        <p className={css.empty} data-cy="db-tables-empty">
          No tables found for <code>{props.params.refName}</code>
        </p>
      )}
    </div>
  );
}

export default function SchemaList(props: Props) {
  const res = useTableNames(props.params);
  return (
    <Section tab={0} refetch={res.refetch}>
      <QueryHandler
        result={{ ...res, data: res.tables }}
        render={data => <Inner {...props} tables={data} />}
      />
    </Section>
  );
}
