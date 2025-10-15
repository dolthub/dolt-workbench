import useDoltServer from "@hooks/useTauri/useDoltServer";


export default function useTauri() {
  const { startDoltServer, removeDoltServer } = useDoltServer();

  function apiConfig() {
    return {
      graphqlApiUrl: process.env.GRAPHQLAPI_URL,
    }
  }

  return { startDoltServer, removeDoltServer, apiConfig };
}
