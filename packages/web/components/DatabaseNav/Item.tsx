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
};

export default function NavItem(props: Props) {
  const tabNameLowerCase = props.name.toLowerCase();
  if (props.hide) return null;
  const url = getUrlForRefName(props.params, props.name);
  return (
    <li data-cy={`db-${tabNameLowerCase.replace(/\s/g, "-")}-tab`}>
      <Link
        className={cx(css.tab, {
          [css.active]: props.i === props.initialTabIndex,
        })}
        {...url}
      >
        <span className={cx(css.innerTab, css[tabNameLowerCase])}>
          {props.name}
        </span>
      </Link>
    </li>
  );
}
