import useDoltServer from "@hooks/useTauri/useDoltServer";
import { getMenu } from "@hooks/useTauri/utils";
import { useRouter } from "next/router";


export default function useTauri() {
  const { startDoltServer, cloneDoltDatabase, removeDoltServer } = useDoltServer();
  const router = useRouter();

  function apiConfig() {
    return {
      graphqlApiUrl: process.env.GRAPHQLAPI_URL,
    }
  }

  async function updateMenu(databaseName?: string) {
    const menu = await getMenu(!!databaseName, router);
    await menu.setAsAppMenu();
  }

  return { startDoltServer, cloneDoltDatabase, removeDoltServer, apiConfig, updateMenu };
}
