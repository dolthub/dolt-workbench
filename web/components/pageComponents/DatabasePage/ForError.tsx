import Page404 from "@components/Page404";
import DatabaseLayout from "@components/layouts/DatabaseLayout";
import { ApolloErrorType } from "@lib/errors/types";
import { DatabasePageParams } from "@lib/params";
import { RefUrl, database } from "@lib/urls";
import { ReactNode } from "react";

type Props = {
  error?: ApolloErrorType;
  params: DatabasePageParams;
  initialTabIndex?: number;
  smallHeaderBreadcrumbs?: ReactNode;
  leftTableNav?: ReactNode;
  routeRefChangeTo?: RefUrl;
};

export default function ForError(props: Props) {
  return (
    <DatabaseLayout
      {...props}
      initialTabIndex={props.initialTabIndex ?? 0}
      routeRefChangeTo={props.routeRefChangeTo ?? database}
    >
      <Page404 error={props.error} title="Error fetching database" />
    </DatabaseLayout>
  );
}
