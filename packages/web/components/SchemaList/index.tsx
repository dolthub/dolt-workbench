import Section from "@components/DatabaseTableNav/Section";
import { useRowsForDoltSchemasQuery } from "@gen/graphql-types";
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
        kind="view"
        items={getSchemaItemsFromRows("view", res.data?.doltSchemas.list)}
        loading={res.loading}
      />
      <h4>Triggers</h4>
      <List
        params={props.params}
        kind="trigger"
        items={getSchemaItemsFromRows("trigger", res.data?.doltSchemas.list)}
        loading={res.loading}
      />
      <h4>Events</h4>
      <List
        params={props.params}
        kind="event"
        items={getSchemaItemsFromRows("event", res.data?.doltSchemas.list)}
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
