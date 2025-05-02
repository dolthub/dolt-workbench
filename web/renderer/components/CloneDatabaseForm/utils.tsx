import Link from "@components/links/Link";
import { ConfigState } from "@components/pageComponents/ConnectionsPage/NewConnection/context/state";
import { DatabaseConnectionFragment } from "@gen/graphql-types";
import { connections as connectionsUrl } from "@lib/urls";

type DisabledReturnType = {
  disabled: boolean;
  message?: React.ReactNode;
};

export function getStartLocalDoltServerDisabled(
  state: ConfigState,
  connections?: DatabaseConnectionFragment[],
): DisabledReturnType {
  if (!state.database) {
    return { disabled: true, message: <span>Database name is required.</span> };
  }
  if (!state.owner) {
    return { disabled: true, message: <span>Owner name is required.</span> };
  }

  if (connections?.some(connection => connection.isLocalDolt)) {
    return {
      disabled: true,
      message: (
        <div>
          <p>Already have one internal dolt server instance.</p>
          <p>
            Go to <Link {...connectionsUrl}>Connections</Link> and remove it
            before adding a new one.
          </p>
        </div>
      ),
    };
  }

  return { disabled: false };
}
