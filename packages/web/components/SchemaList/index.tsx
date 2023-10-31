import Section from "@components/DatabaseTableNav/Section";
import { SchemaType, useRowsForDoltSchemasQuery } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import List from "./List";
import Procedures from "./Procedures";
import Tables from "./Tables";
import css from "./index.module.css";
import { getSchemaItemsFromRows } from "./utils";

type Props = {
  params: RefParams & { q?: string };
};

function Inner(props: Props) {
  const res = useRowsForDoltSchemasQuery({ variables: props.params });
  return (
    <div className={css.container}>
      <h4>Tables</h4>
      <Tables params={props.params} />
      <h4>Views</h4>
      <List
        params={props.params}
        kind={SchemaType.View}
        items={getSchemaItemsFromRows(SchemaType.View, res.data?.doltSchemas)}
        loading={res.loading}
      />
      <h4>Triggers</h4>
      <List
        params={props.params}
        kind={SchemaType.Trigger}
        items={getSchemaItemsFromRows(
          SchemaType.Trigger,
          res.data?.doltSchemas,
        )}
        loading={res.loading}
      />
      <h4>Events</h4>
      <List
        params={props.params}
        kind={SchemaType.Event}
        items={getSchemaItemsFromRows(SchemaType.Event, res.data?.doltSchemas)}
        loading={res.loading}
      />
      <h4>Procedures</h4>
      <Procedures params={props.params} />
    </div>
  );
}

export default function SchemaList(props: Props) {
  return (
    <Section tab={0}>
      <Inner {...props} />
    </Section>
  );
}
