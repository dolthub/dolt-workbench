import Loader from "@components/Loader";
import { useDefaultBranchPageQuery } from "@gen/graphql-types";
import { OptionalRefParams, RefParams } from "@lib/params";
import { RefUrl } from "@lib/urls";
import { ReactNode, cloneElement } from "react";
import ForEmpty from "../ForEmpty";
import ForError from "../ForError";
import ForTable from "../ForTable";
import DatabasePage from "../component";

type Props = {
  params: OptionalRefParams;
  title?: string;
  hideDefaultTable?: boolean;
  initialTabIndex?: number;
  children?: JSX.Element;
  wide?: boolean;
  smallHeaderBreadcrumbs?: ReactNode;
  initialSmallHeader?: boolean;
  onScroll?: () => void;
  leftTableNav?: ReactNode;
  leftNavInitiallyOpen?: boolean;
  showSqlConsole?: boolean;
  routeRefChangeTo: RefUrl;
};

export default function ForDefaultBranch({
  params,
  hideDefaultTable = false,
  ...props
}: Props) {
  const { data, loading, error } = useDefaultBranchPageQuery({
    variables: { ...params, filterSystemTables: true },
  });
  if (loading) return <Loader loaded={false} />;

  if (error) {
    return <ForError {...props} error={error} params={params} />;
  }
  const defaultBranch = data?.defaultBranch;
  const branchName = defaultBranch?.branchName;
  const defaultTableName =
    defaultBranch?.tableNames &&
    defaultBranch.tableNames.length > 0 &&
    defaultBranch.tableNames[0];

  if (!branchName || !defaultTableName) {
    return props.children ? (
      <DatabasePage
        {...props}
        params={{ ...params, refName: params.refName ?? branchName }}
        initialTabIndex={props.initialTabIndex ?? 0}
      >
        {props.children}
      </DatabasePage>
    ) : (
      <ForEmpty params={{ ...params, refName: branchName }} />
    );
  }

  const pageParams: RefParams & {
    tableName?: string;
  } =
    defaultTableName && !hideDefaultTable
      ? { ...params, refName: branchName, tableName: defaultTableName }
      : { ...params, refName: params.refName ?? branchName };

  if (props.children) {
    return (
      <DatabasePage
        {...props}
        params={pageParams}
        initialTabIndex={props.initialTabIndex ?? 0}
      >
        {cloneElement(props.children, { branchName })}
      </DatabasePage>
    );
  }

  return pageParams.tableName ? (
    <ForTable params={{ ...pageParams, tableName: pageParams.tableName }} />
  ) : (
    <ForEmpty title={props.title} params={pageParams} />
  );
}
