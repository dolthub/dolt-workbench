import QueryHandler from "@components/util/QueryHandler";
import { useDiffContext } from "@contexts/diff";
import { Maybe } from "@dolthub/web-utils";
import {
  DiffSummaryFragment,
  SchemaDiffFragment,
  useSchemaDiffQuery,
} from "@gen/graphql-types";
import SchemaDiff from "./SchemaDiff";
import SchemaPatch from "./SchemaPatch";
import css from "./index.module.css";

type Props = {
  diffSummary: DiffSummaryFragment;
};

type InnerProps = {
  schemaDiff?: Maybe<SchemaDiffFragment>;
};

function Inner({ schemaDiff }: InnerProps) {
  const showSchemaPatch =
    !!schemaDiff?.schemaPatch?.length && schemaDiff.schemaPatch[0] !== "";
  return (
    <div className={css.schemaSection} data-cy="schema-diff">
      <h2>Schema Diff</h2>
      <SchemaDiff schemaDiff={schemaDiff?.schemaDiff} />
      {showSchemaPatch && (
        <div>
          <h2>Schema Patch</h2>
          <SchemaPatch schemaPatch={schemaDiff.schemaPatch} />
        </div>
      )}
    </div>
  );
}

export default function SchemaSection(props: Props) {
  const { params, type } = useDiffContext();
  const res = useSchemaDiffQuery({
    variables: {
      ...params,
      tableName: props.diffSummary.tableName,
      type,
    },
  });
  return (
    <QueryHandler
      result={res}
      render={data => <Inner schemaDiff={data.schemaDiff} />}
    />
  );
}
