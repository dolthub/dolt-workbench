import DatabaseLayout from "@components/layouts/DatabaseLayout";
import { SqlEditorProvider } from "@contexts/sqleditor";
import { DatabasePageParams } from "@lib/params";
import { RefUrl } from "@lib/urls";
import { ReactNode } from "react";

type Props = {
  params: DatabasePageParams;
  children: ReactNode;
  title?: string;
  initialTabIndex: number;
  empty?: boolean;
  wide?: boolean;
  initialSmallHeader?: boolean;
  onScroll?: () => void;
  leftTableNav?: ReactNode;
  leftNavInitiallyOpen?: boolean;
  showSqlConsole?: boolean;
  noMobileWarnings?: boolean;
  routeRefChangeTo: RefUrl;
};

export default function DatabasePage({ params, children, ...props }: Props) {
  return (
    <SqlEditorProvider>
      <DatabaseLayout
        {...props}
        params={params}
        initialTabIndex={props.initialTabIndex}
      >
        {children}
      </DatabaseLayout>
    </SqlEditorProvider>
  );
}
