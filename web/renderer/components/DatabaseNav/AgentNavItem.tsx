import { useAgentContext } from "@contexts/agent";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  initialTabIndex: number;
  tabIndex: number;
};

export default function AgentNavItem({
  initialTabIndex: _initialTabIndex,
  tabIndex: _tabIndex,
}: Props) {
  const { togglePanel, isPanelOpen } = useAgentContext();

  // Only show in Electron environment
  if (process.env.NEXT_PUBLIC_FOR_ELECTRON !== "true") {
    return null;
  }

  return (
    <li data-cy="db-agent-tab">
      <button
        type="button"
        className={cx(css.tab, css.tabButton, {
          [css.active]: isPanelOpen,
        })}
        onClick={togglePanel}
      >
        <span className={css.innerTab}>Agent</span>
      </button>
    </li>
  );
}
