import { SmallLoader } from "@dolthub/react-components";
import { pluralize } from "@dolthub/web-utils";
import { SchemaType } from "@gen/graphql-types";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import { RefOptionalSchemaParams, RefParams } from "@lib/params";
import { useEffect } from "react";
import Item from "./Item";
import NotFound from "./NotFound";
import css from "./index.module.css";
import { getActiveItem } from "./utils";

type InnerProps = {
  params: RefOptionalSchemaParams & { q?: string };
  items: string[];
  kind: SchemaType;
  loading?: boolean;
};

function showCreateQuery(
  name: string,
  kind: SchemaType,
  isPostgres: boolean,
  dbName?: string,
  schemaName?: string,
): string {
  if (!isPostgres) return `SHOW CREATE ${kind.toUpperCase()} \`${name}\``;
  switch (kind) {
    case SchemaType.Table:
      return `SELECT ordinal_position, column_name, udt_name as data_type, is_nullable, column_default FROM information_schema.columns WHERE${schemaName ? ` table_schema = '${schemaName}' AND` : ""}${dbName ? ` table_catalog = '${dbName}' AND` : ""} table_name = '${name}'`;
    case SchemaType.View:
      return `SELECT pg_get_viewdef('${schemaName ?? "public"}.${name}'::regclass, true)`;
    case SchemaType.Trigger:
      return `SELECT pg_get_triggerdef(oid) FROM pg_trigger where tgname = '${name}'`;
    case SchemaType.Event:
      return `SELECT * FROM pg_event_trigger WHERE evtname = '${name}'`;
    case SchemaType.Procedure:
      return `SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = '${name}'`;
    default:
      return "";
  }
}

export default function List(props: InnerProps) {
  const { isDolt, isPostgres } = useDatabaseDetails();
  const activeItem = getActiveItem(props.kind, props.params.q, isPostgres);
  const pluralKind = pluralize(2, props.kind.toLowerCase());

  useEffect(() => {
    if (!activeItem) return;
    const el = document.getElementById(activeItem);
    el?.scrollIntoView();
  });

  if (props.loading) {
    return (
      <SmallLoader.WithText
        text={`Loading ${pluralKind}...`}
        loaded={false}
        outerClassName={css.smallLoader}
      />
    );
  }

  return (
    <div data-cy={`db-${pluralKind}-def-list`}>
      {props.items.length ? (
        <ol>
          {props.items.map(t => (
            <Item
              key={t}
              name={t}
              params={props.params}
              isActive={t === activeItem}
              query={showCreateQuery(
                t,
                props.kind,
                isPostgres,
                getDatabaseName(props.params, isDolt, isPostgres),
                props.params.schemaName,
              )}
            />
          ))}
        </ol>
      ) : (
        <NotFound params={props.params} name={pluralKind} />
      )}
    </div>
  );
}

function getDatabaseName(
  params: RefParams,
  isDolt: boolean,
  isPostgres: boolean,
): string | undefined {
  if (!isPostgres) return undefined;
  if (isDolt) return `${params.databaseName}/${params.refName}`;
  return params.databaseName;
}
