import { SmallLoader } from "@dolthub/react-components";
import { pluralize } from "@dolthub/web-utils";
import { SchemaType } from "@gen/graphql-types";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import useSqlBuilder from "@hooks/useSqlBuilder";
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

export default function List(props: InnerProps) {
  const { showCreateQuery, isPostgres } = useSqlBuilder(
    props.params.connectionName,
  );
  const { isDolt } = useDatabaseDetails(props.params.connectionName);
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
