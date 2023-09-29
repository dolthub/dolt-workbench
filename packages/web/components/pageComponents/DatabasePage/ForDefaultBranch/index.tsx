import Loader from "@components/Loader";
import { useTableNamesQuery } from "@gen/graphql-types";
import { DatabasePageParams, RefParams } from "@lib/params";
import { ReactNode, cloneElement } from "react";
import ForEmpty from "../ForEmpty";
import ForError from "../ForError";
import ForTable from "../ForTable";
import DatabasePage from "../component";

type Props = {
  params: DatabasePageParams;
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
  noMobileWarnings?: boolean;
};

export default function ForDefaultBranch({
  params,
  hideDefaultTable = false,
  ...props
}: Props) {
  const { data, loading, error } = useTableNamesQuery();
  if (loading) return <Loader loaded={false} />;

  if (error) {
    return <ForError {...props} error={error} params={params} />;
  }

  const branchName = "main";
  const defaultTableName =
    data?.tableNames &&
    data.tableNames.list.length > 0 &&
    data.tableNames.list[0];

  if (!defaultTableName) {
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
