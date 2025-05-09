import { ExternalLink } from "@dolthub/react-components";
import { dockerHubRepo } from "@lib/constants";
import MainLayout from "@components/layouts/MainLayout";
import WelcomeMessage from "./WelcomeMessage";
import ConnectionTabs from "./ConnectionTabs";
import css from "./index.module.css";
import { ConfigProvider } from "./context/config";

type Props = {
  noExistingConnection?: boolean;
};

type InnerProps = {
  showWelcomeMsg?: boolean;
};

function Inner({ showWelcomeMsg }: InnerProps) {
  return (
    <div className={css.databaseForm} data-cy="add-connection-form">
      {showWelcomeMsg && <WelcomeMessage />}
      <div className={css.whiteContainer}>
        <div className={css.top}>
          <h3>Set up a new connection</h3>
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
  );
}

export default function NewConnection({ noExistingConnection }: Props) {
  return noExistingConnection ? (
    <Inner showWelcomeMsg />
  ) : (
    <MainLayout className={css.container}>
      <Inner />
    </MainLayout>
  );
}
