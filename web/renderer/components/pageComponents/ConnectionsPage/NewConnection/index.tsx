import { Checkbox, ExternalLink } from "@dolthub/react-components";
import { dockerHubRepo } from "@lib/constants";
import MainLayout from "@components/layouts/MainLayout";
import { useState } from "react";
import WelcomeMessage from "./WelcomeMessage";
import ConnectionTabs from "./ConnectionTabs";
import css from "./index.module.css";
import { ConfigProvider, useConfigContext } from "./context/config";

type Props = {
  noExistingConnection?: boolean;
};

type InnerProps = {
  showWelcomeMsg?: boolean;
};

function Inner({ showWelcomeMsg }: InnerProps) {
  const { setState } = useConfigContext();
  const [cloneDolt, setCloneDolt] = useState(false);

  return (
    <div className={css.databaseForm}>
      {showWelcomeMsg && <WelcomeMessage />}
      <div className={css.whiteContainer}>
        <div className={css.top}>
          <h3>Set up a new connection</h3>
          <p className={css.instructions}>
            View instructions for connecting to local and Docker installed
            databases <ExternalLink href={dockerHubRepo}>here</ExternalLink>.
          </p>
          <Checkbox
            checked={cloneDolt}
            onChange={() => {
              setState({ cloneDolt: !cloneDolt });
              setCloneDolt(!cloneDolt);
            }}
            name="clone-dolt-server"
            label="Clone a remote Dolt database"
            description="Clone a dolt database from DoltHub"
            className={css.checkbox}
          />
        </div>

        <ConnectionTabs />
      </div>
    </div>
  );
}

export default function NewConnection({ noExistingConnection }: Props) {
  return noExistingConnection ? (
    <ConfigProvider>
      <Inner showWelcomeMsg />
    </ConfigProvider>
  ) : (
    <MainLayout className={css.container}>
      <ConfigProvider>
        <Inner />
      </ConfigProvider>
    </MainLayout>
  );
}
