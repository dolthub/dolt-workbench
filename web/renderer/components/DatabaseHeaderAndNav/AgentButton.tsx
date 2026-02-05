import { useAgentContext } from "@contexts/agent";
import { RiRobot3Fill } from "react-icons/ri";
import cx from "classnames";
import css from "./index.module.css";

export default function AgentButton() {
  const { togglePanel, isPanelOpen } = useAgentContext();

  // Only show in Electron environment
  if (process.env.NEXT_PUBLIC_FOR_ELECTRON !== "true") {
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
