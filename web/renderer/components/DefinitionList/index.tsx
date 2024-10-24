import Section from "@components/DatabaseTableNav/Section";
import { SchemaType, useRowsForDoltSchemasQuery } from "@gen/graphql-types";
import { RefOptionalSchemaParams } from "@lib/params";
import List from "./List";
import Procedures from "./Procedures";
import Tables from "./Tables";
import css from "./index.module.css";
import { getDefItemsFromRows } from "./utils";

type Props = {
  params: RefOptionalSchemaParams & { q?: string };
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
        items={getDefItemsFromRows(SchemaType.View, res.data?.doltSchemas)}
        loading={res.loading}
      />
      <h4>Triggers</h4>
      <List
        params={props.params}
        kind={SchemaType.Trigger}
        items={getDefItemsFromRows(SchemaType.Trigger, res.data?.doltSchemas)}
        loading={res.loading}
      />
      <h4>Events</h4>
      <List
        params={props.params}
        kind={SchemaType.Event}
        items={getDefItemsFromRows(SchemaType.Event, res.data?.doltSchemas)}
        loading={res.loading}
      />
      <h4>Procedures</h4>
      <Procedures params={props.params} />
    </div>
  );
}

export default function DefinitionList(props: Props) {
  return (
    <Section tab={0}>
      <Inner {...props} />
    </Section>
  );
}
