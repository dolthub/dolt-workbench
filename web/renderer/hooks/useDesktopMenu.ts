import { DatabasePageParams } from "@lib/params";
import {
  commitGraph,
  createTable,
  newBranch,
  newRelease,
  query,
  schemaDiagram,
  upload,
} from "@lib/urls";
import { NextRouter, useRouter } from "next/router";
import useDefaultBranch from "@hooks/useDefaultBranch";
import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";

export default function useDesktopMenu(params: DatabasePageParams) {
  const router = useRouter();
  const { defaultBranchName } = useDefaultBranch(params);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_FOR_TAURI === "true") {
      const unlistenMenuEvent = listen<{ page: string }>(
        "menu-clicked",
        event => {
          handleMenuNavigation(
            params,
            defaultBranchName,
            event.payload.page,
            router,
          );
        },
      );
      return () => {
        unlistenMenuEvent.then(unlisten => unlisten()).catch(console.error);
      };
    }
  }, [params, defaultBranchName, router]);

  if (process.env.NEXT_PUBLIC_FOR_ELECTRON === "true") {
    window.ipc.onMenuClicked(async (value: string) => {
      handleMenuNavigation(params, defaultBranchName, value, router);
    });
  }
}

function handleMenuNavigation(
  params: DatabasePageParams,
  defaultBranchName: string,
  value: string,
  router: NextRouter,
) {
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
    case "new-table": {
      const { href, as } = createTable(paramsWithRef);
      router.push(href, as).catch(console.error);
      break;
    }
    case "new-branch": {
      const { href, as } = newBranch(paramsWithRef);
      router.push(href, as).catch(console.error);
      break;
    }
    case "new-release": {
      const { href, as } = newRelease(paramsWithRef);
      router.push(href, as).catch(console.error);
      break;
    }
    case "run-query": {
      const { href, as } = query(paramsWithRef);
      router.push(href, as).catch(console.error);
      break;
    }
    default:
      break;
  }
}
