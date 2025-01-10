import { ExternalLink } from "@dolthub/react-components";
import { dockerHubRepo } from "@lib/constants";
import MainLayout from "@components/layouts/MainLayout";
import WelcomeMessage from "./WelcomeMessage";
import ConnectionTabs from "./ConnectionTabs";
import css from "./index.module.css";
import { ConfigProvider } from "./context/config";

export default function NewConnection() {
  return (
    <MainLayout className={css.container}>
      <div className={css.databaseForm}>
        <WelcomeMessage />
        <div className={css.whiteContainer}>
          <div className={css.top}>
            <h3>Set up new connection</h3>
            <p className={css.instructions}>
              View instructions for connecting to local and Docker installed
              databases <ExternalLink href={dockerHubRepo}>here</ExternalLink>.
            </p>
          </div>
          <ConfigProvider>
            <ConnectionTabs />
          </ConfigProvider>
        </div>
      </div>
    </MainLayout>
  );
}
