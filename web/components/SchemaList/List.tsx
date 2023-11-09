import SmallLoader from "@components/SmallLoader";
import { SchemaType } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { pluralize } from "@lib/pluralize";
import { useEffect } from "react";
import Item from "./Item";
import NotFound from "./NotFound";
import css from "./index.module.css";
import { getActiveItem } from "./utils";

type InnerProps = {
  params: RefParams & { q?: string };
  items: string[];
  kind: SchemaType;
  loading?: boolean;
};

export default function List(props: InnerProps) {
  const activeItem = getActiveItem(props.kind, props.params.q);
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
    <div data-cy={`db-${pluralKind}-schema-list`}>
      {props.items.length ? (
        <ol>
          {props.items.map(t => (
            <Item
              key={t}
              name={t}
              params={props.params}
              isActive={t === activeItem}
              query={`SHOW CREATE ${props.kind.toUpperCase()} \`${t}\``}
            />
          ))}
        </ol>
      ) : (
        <NotFound params={props.params} name={pluralKind} />
      )}
    </div>
  );
}
