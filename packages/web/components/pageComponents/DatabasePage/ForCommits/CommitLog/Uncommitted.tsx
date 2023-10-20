import Loader from "@components/Loader";
import Link from "@components/links/Link";
import { StatusFragment, useGetStatusQuery } from "@gen/graphql-types";
import { RefParams, RequiredCommitsParams } from "@lib/params";
import { diff } from "@lib/urls";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  params: RefParams;
};

type InnerProps = Props & {
  status: StatusFragment[];
};

type ItemProps = {
  params: RequiredCommitsParams & { refName: string };
};

function Item(props: ItemProps) {
  return (
    <li
      className={css.item}
      id={props.params.toCommitId}
      data-cy="commit-log-item-uncommitted"
    >
      <Link {...diff(props.params)}>{props.params.toCommitId}</Link>
    </li>
  );
}

function Inner(props: InnerProps) {
  const hasStagedChanges = props.status.some(s => s.staged);
  const hasWorkingChanges = props.status.some(s => !s.staged);
  return (
    <ol className={cx(css.list, css.uncommittedList)}>
      <li className={css.header}>
        <span className={css.bullet} />
        Uncommitted changes
      </li>
      {hasWorkingChanges && (
        <Item
          params={{
            ...props.params,
            toCommitId: "WORKING",
            fromCommitId: "STAGED",
          }}
        />
      )}
      {hasStagedChanges && (
        <Item
          params={{
            ...props.params,
            toCommitId: "STAGED",
            fromCommitId: "HEAD",
          }}
        />
      )}
    </ol>
  );
}

export default function Uncommitted(props: Props) {
  const res = useGetStatusQuery({ variables: props.params });
  if (res.loading) return <Loader loaded={false} />;
  if (res.error || !res.data || res.data.status.length === 0) {
    return null;
  }
  return <Inner {...props} status={res.data.status} />;
}
