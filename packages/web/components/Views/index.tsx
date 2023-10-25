import Section from "@components/DatabaseTableNav/Section";
import Loader from "@components/Loader";
import Tooltip from "@components/Tooltip";
import { RowForViewsFragment } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import NoViews from "./NoViews";
import ViewItem from "./ViewItem";
import css from "./index.module.css";
import useViewList from "./useViewList";

type ViewsProps = {
  params: RefParams & { q?: string };
};

type Props = ViewsProps & {
  rows?: RowForViewsFragment[];
};

function Inner({ rows, params }: Props) {
  return (
    <div className={css.views}>
      <Tooltip id="view-icon-tip" place="left" />
      {rows?.length ? (
        <ol data-cy="db-views-list">
          {rows.map(r => (
            <ViewItem
              key={r.columnValues[1].displayValue}
              view={r}
              params={params}
            />
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
      <Loader loaded={!res.loading}>
        <Inner params={props.params} rows={res.views} />
      </Loader>
    </Section>
  );
}
