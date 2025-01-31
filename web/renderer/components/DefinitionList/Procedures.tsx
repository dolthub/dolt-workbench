import { QueryHandler, SmallLoader } from "@dolthub/react-components";
import { SchemaType, useRowsForDoltProceduresQuery } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import List from "./List";
import css from "./index.module.css";

type Props = {
  params: RefParams & { q?: string };
};

export default function Procedures(props: Props) {
  const res = useRowsForDoltProceduresQuery({
    variables: props.params,
  });

  return (
    <QueryHandler
      result={res}
      loaderComponent={
        <SmallLoader.WithText
          text="Loading procedures..."
          loaded={false}
          outerClassName={css.smallLoader}
        />
      }
      render={data => (
        <List
          {...props}
          items={data.doltProcedures.map(e => e.name)}
          kind={SchemaType.Procedure}
        />
      )}
    />
  );
}
