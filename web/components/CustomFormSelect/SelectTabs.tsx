import { Btn } from "@dolthub/react-components";
import cx from "classnames";
import css from "./index.module.css";
import { Tab } from "./types";

type Props = {
  tabs: Tab[];
};

export default function SelectTabs({ tabs }: Props) {
  return (
    <div className={css.buttonContainer} data-cy="selector-tabs">
      {tabs.map(tab => (
        <Btn
          key={tab.label}
          className={cx(css.button, css.buttonDisabled, {
            [css.activeButton]: tab.active,
          })}
          onClick={tab.onClick}
          disabled={tab.active}
          data-cy={`${tab.label.toLowerCase()}-tab`}
        >
          {tab.label}
        </Btn>
      ))}
    </div>
  );
}
