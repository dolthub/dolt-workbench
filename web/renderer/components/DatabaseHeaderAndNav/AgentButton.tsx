import { useAgentContext } from "@contexts/agent";
import { RiRobot3Fill } from "react-icons/ri";
import cx from "classnames";
import css from "./index.module.css";

function Inner() {
  const { togglePanel, isPanelOpen } = useAgentContext();

  return (
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
  );
}

export default function AgentButton() {
  if (process.env.NEXT_PUBLIC_FOR_ELECTRON !== "true") {
    return null;
  }

  return <Inner />;
}
