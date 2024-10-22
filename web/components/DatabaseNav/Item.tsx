import Link from "@components/links/Link";
import { OptionalRefParams } from "@lib/params";
import cx from "classnames";
import css from "./index.module.css";
import { getUrlForRefName } from "./utils";

type Props = {
  name: string;
  params: OptionalRefParams;
  hide?: boolean;
  i: number;
  initialTabIndex: number;
  doltDisabled?: boolean;
};

export default function NavItem(props: Props) {
  if (props.hide) return null;
  if (props.doltDisabled) {
    return (
      <li className={css.disabledTab}>
        <span
          className={css.innerTab}
          data-tooltip-position="top"
          data-tooltip-id="disabled-database-nav-item"
          data-tooltip-content={`${props.name} tab is only available for Dolt databases`}
        >
          {props.name}
        </span>
      </li>
    );
  }
  const url = getUrlForRefName(props.params, props.name);
  return (
    <li>
      <Link
        className={cx(css.tab, {
          [css.active]: props.i === props.initialTabIndex,
        })}
        {...url}
      >
        <span className={css.innerTab}>{props.name}</span>
      </Link>
    </li>
  );
}
