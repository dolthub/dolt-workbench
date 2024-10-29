import DatabaseLayout from "@components/layouts/DatabaseLayout";
import { SqlEditorProvider } from "@contexts/sqleditor";
import useElectronMenu from "@hooks/useElectronMenu";
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
  smallHeaderBreadcrumbs?: ReactNode;
  initialSmallHeader?: boolean;
  onScroll?: () => void;
  leftTableNav?: ReactNode;
  leftNavInitiallyOpen?: boolean;
  showSqlConsole?: boolean;
  routeRefChangeTo: RefUrl;
};

export default function DatabasePage({ params, children, ...props }: Props) {
  useElectronMenu(params);

  return (
    <SqlEditorProvider params={params}>
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
