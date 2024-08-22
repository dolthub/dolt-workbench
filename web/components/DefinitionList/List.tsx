import { SmallLoader } from "@dolthub/react-components";
import { pluralize } from "@dolthub/web-utils";
import { SchemaType } from "@gen/graphql-types";
import useSqlBuilder from "@hooks/useSqlBuilder";
import { RefMaybeSchemaParams } from "@lib/params";
import { useEffect } from "react";
import Item from "./Item";
import NotFound from "./NotFound";
import css from "./index.module.css";
import { getActiveItem } from "./utils";

type InnerProps = {
  params: RefMaybeSchemaParams & { q?: string };
  items: string[];
  kind: SchemaType;
  loading?: boolean;
};

export default function List(props: InnerProps) {
  const { showCreateQuery, isPostgres } = useSqlBuilder();
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
              query={showCreateQuery(t, props.kind, props.params.schemaName)}
            />
          ))}
        </ol>
      ) : (
        <NotFound params={props.params} name={pluralKind} />
      )}
    </div>
  );
}
