import Section from "@components/DatabaseTableNav/Section";
import { Loader } from "@dolthub/react-components";
import { SchemaItemFragment } from "@gen/graphql-types";
import { RefOptionalSchemaParams } from "@lib/params";
import NoViews from "./NoViews";
import ViewItem from "./ViewItem";
import css from "./index.module.css";
import useViewList from "./useViewList";

type ViewsProps = {
  params: RefOptionalSchemaParams & { q?: string };
};

type Props = ViewsProps & {
  views?: SchemaItemFragment[];
};

function Inner({ views, params }: Props) {
  return (
    <div className={css.views}>
      {views?.length ? (
        <ol data-cy="db-views-list">
          {views.map(v => (
            <ViewItem key={v.name} view={v} params={params} />
          ))}
        </ol>
      ) : (
        <NoViews />
      )}
    </div>
  );
}

// We don't want to return an error here because if there are no views,
// the dolt_schemas system table will not exist
export default function Views(props: ViewsProps) {
  const res = useViewList(props.params);
  return (
    <Section tab={1} refetch={res.refetch}>
      {res.loading ? (
        <Loader loaded={false} />
      ) : (
        <Inner params={props.params} views={res.views} />
      )}
    </Section>
  );
}
