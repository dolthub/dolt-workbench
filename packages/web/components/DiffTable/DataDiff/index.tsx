import Button from "@components/Button";
import DatabaseOptionsDropdown from "@components/DatabaseOptionsDropdown";
import Errors from "@components/DatabaseTableHeader/Errors";
import ErrorMsg from "@components/ErrorMsg";
import Loader from "@components/Loader";
import { useDataTableContext } from "@contexts/dataTable";
import { useDiffContext } from "@contexts/diff";
import { DiffRowType } from "@gen/graphql-types";
import useFocus from "@hooks/useFocus";
import { ApolloErrorType } from "@lib/errors/types";
import { RequiredRefsParams } from "@lib/params";
import InfiniteScroll from "react-infinite-scroller";
import DiffMsg from "./DiffMsg";
import FilterByType from "./FilterByType";
import HiddenCols from "./HiddenCols";
import Table from "./Table";
import ViewSqlLink from "./ViewSqlLink";
import css from "./index.module.css";
import { RowDiffState } from "./state";
import useRowDiffs from "./useRowDiffs";
import useToggleColumns from "./useToggleColumns";
import { HiddenColIndexes, SetHiddenColIndexes, getIsPKTable } from "./utils";

type Props = {
  hiddenColIndexes: HiddenColIndexes;
  setHiddenColIndexes: SetHiddenColIndexes;
  params: RequiredRefsParams & {
    tableName: string;
    refName: string;
  };
  hideCellButtons?: boolean;
};

type InnerProps = Props & {
  fetchMore: () => Promise<void>;
  setFilter: (d: DiffRowType | undefined) => void;
  state: RowDiffState;
  hasMore: boolean;
  error?: ApolloErrorType;
};

function Inner(props: InnerProps) {
  const { state, fetchMore, setFilter, hasMore, error } = props;

  const { setScrollToTop } = useFocus();
  const { removeCol, onClickHideUnchangedCol, hideUnchangedCols } =
    useToggleColumns(
      state.cols,
      state.rowDiffs,
      props.hiddenColIndexes,
      props.setHiddenColIndexes,
    );

  const isPKTable = getIsPKTable(state.cols);

  // For diff tables we want to use `refName` from `useDiffContext`, which is either the `fromBranchName`
  // for PR diffs or the current ref for commit diffs
  const { refName, type } = useDiffContext();
  const res = useDataTableContext();

  return (
    <div className={css.container}>
      <div className={css.topContainer}>
        <DatabaseOptionsDropdown
          onClickHideUnchangedCol={onClickHideUnchangedCol}
          showingHideUnchangedCol={hideUnchangedCols}
          className={css.optionButton}
        >
          <ViewSqlLink {...props} type={type} />
        </DatabaseOptionsDropdown>
        <FilterByType filter={state.filter} setFilter={setFilter} />
      </div>
      <DiffMsg
        err={res.error}
        tableName={props.params.tableName}
        refName={res.params.refName}
        isPKTable={isPKTable}
      />
      <ErrorMsg err={error} className={css.err} />

      {!!props.hiddenColIndexes.length && (
        <HiddenCols
          {...props}
          onClickUnchangedCols={removeCol}
          cols={state.cols}
        />
      )}

      <Errors />
      {state.rowDiffs.length ? (
        <InfiniteScroll
          hasMore={hasMore}
          loadMore={fetchMore}
          initialLoad={false}
          loader={<div key={0}>Loading rows ...</div>}
          useWindow={false}
          getScrollParent={() => document.getElementById("main-content")}
          className={css.infiniteScrollContainer}
        >
          <Table {...props} state={state} refName={refName} error={res.error} />
        </InfiniteScroll>
      ) : (
        <p className={css.noChanges}>No changes to this table in this diff</p>
      )}

      <div className={css.mobileTable}>
        <Table
          {...props}
          state={state}
          refName={refName}
          error={res.error}
          forMobile
        />
        {hasMore && <Button onClick={fetchMore}>Load More</Button>}
      </div>

      {state.rowDiffs.length > 50 && (
        <Button className={css.toTop} onClick={() => setScrollToTop(true)}>
          go to top
        </Button>
      )}
    </div>
  );
}

export default function DataDiff(props: Props) {
  const { type } = useDiffContext();
  const { state, fetchMore, setFilter, hasMore, loading } = useRowDiffs(
    props.params,
    type,
  );

  if (loading) return <Loader loaded={false} />;

  return (
    <Inner
      {...props}
      state={state}
      fetchMore={fetchMore}
      hasMore={hasMore}
      setFilter={setFilter}
    />
  );
}
