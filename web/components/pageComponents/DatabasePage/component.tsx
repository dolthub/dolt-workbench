import DatabaseLayout from "@components/layouts/DatabaseLayout";
import { SqlEditorProvider } from "@contexts/sqleditor";
import useDefaultBranch from "@hooks/useDefaultBranch";
import { DatabasePageParams } from "@lib/params";
import { commitGraph, RefUrl, schemaDiagram, upload } from "@lib/urls";
import { useRouter } from "next/router";
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
  const router = useRouter();
  const { defaultBranchName } = useDefaultBranch(params);
  // route to the correct page based on the menu item clicked
  if (process.env.NEXT_PUBLIC_FOR_ELECTRON === "true") {
    window.ipc.onMenuClicked(async (value: string) => {
      const paramsWithRef = {
        ...params,
        refName: params.refName || defaultBranchName,
      };
      switch (value) {
        case "upload-file": {
          const { href, as } = upload(paramsWithRef);
          router.push(href, as).catch(console.error);
          break;
        }
        case "commit-graph": {
          const { href, as } = commitGraph(paramsWithRef);
          router.push(href, as).catch(console.error);
          break;
        }
        case "schema-diagram": {
          const { href, as } = schemaDiagram(paramsWithRef);
          router.push(href, as).catch(console.error);
          break;
        }
        default:
          break;
      }
    });
  }

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
