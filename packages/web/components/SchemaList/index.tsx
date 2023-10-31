import Section from "@components/DatabaseTableNav/Section";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
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

function DoltFeatures(props: Props) {
  const res = useRowsForDoltSchemasQuery({ variables: props.params });
  return (
    <>
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
    </>
  );
}

function Inner(props: Props) {
  return (
    <div className={css.container}>
      <h4>Tables</h4>
      <Tables params={props.params} />
      {/* TODO: Make this work for non-Dolt */}
      <NotDoltWrapper
        showNotDoltMsg
        feature="Viewing schemas for views, triggers, events, and procedures"
      >
        <DoltFeatures {...props} />
      </NotDoltWrapper>
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
