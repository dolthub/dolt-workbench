import Link from "@components/links/Link";
import Maybe from "@lib/Maybe";
import { RefParams } from "@lib/params";
import { table as tableUrl } from "@lib/urls";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  tableName: string;
  params: RefParams & { tableName?: Maybe<string> };
};

export default function MobileTableListItem({ tableName, params }: Props) {
  const active = tableName === params.tableName;

  return (
    <li
      className={cx(css.item, {
        [css.active]: active,
      })}
    >
      <div className={cx(css.tableName, css.mobileTableListItem)}>
        <Link {...tableUrl({ ...params, tableName })}>{tableName}</Link>
        {active && <span className={css.tableStatus}>Viewing</span>}
      </div>
    </li>
  );
}
