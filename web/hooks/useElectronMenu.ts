import { DatabasePageParams } from "@lib/params";
import {
  commitGraph,
  createTable,
  newBranch,
  newRelease,
  schemaDiagram,
  upload,
} from "@lib/urls";
import { useRouter } from "next/router";
import useDefaultBranch from "@hooks/useDefaultBranch";

export default function useElectronMenu(params: DatabasePageParams) {
  const router = useRouter();
  const { defaultBranchName } = useDefaultBranch(params);

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
        default:
          break;
      }
    });
  }
}
