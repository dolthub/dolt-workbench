import { useAgentContext } from "@contexts/agent";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import { RiRobot3Fill } from "react-icons/ri";
import cx from "classnames";
import css from "./index.module.css";

export default function AgentButton() {
  const { togglePanel, isPanelOpen } = useAgentContext();
  const { isDolt, isPostgres } = useDatabaseDetails();

  // Only show in Electron environment, and not for doltgres databases
  if (
    process.env.NEXT_PUBLIC_FOR_ELECTRON !== "true" ||
    (isDolt && isPostgres)
  ) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={cx(css.agentButton, {
          [css.agentButtonActive]: isPanelOpen,
        })}
        onClick={togglePanel}
        data-cy="agent-button"
      >
        <RiRobot3Fill />
      </button>
    </>
  );
}
