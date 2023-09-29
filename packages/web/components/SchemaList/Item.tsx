import Btn from "@components/Btn";
import Link from "@components/links/Link";
import { RefParams } from "@lib/params";
import { sqlQuery } from "@lib/urls";
import { MdPlayCircleOutline } from "@react-icons/all-files/md/MdPlayCircleOutline";
import cx from "classnames";
import css from "./index.module.css";
import { tableIsActive } from "./utils";

type Props = {
  tableName: string;
  params: RefParams & { q?: string };
};

export default function Item({ tableName, params }: Props) {
  const active = tableIsActive(tableName, params.q);
  return (
    <li
      className={cx(css.item, {
        [css.active]: active,
      })}
      data-cy={`db-tables-schema-${tableName}`}
      id={tableName}
    >
      <div className={css.table}>
        <span className={css.tableName}>{tableName}</span>
        <span className={css.right}>
          {active ? (
            <span className={css.tableStatus}>Viewing</span>
          ) : (
            <Link
              {...sqlQuery({
                ...params,
                q: `SHOW CREATE TABLE \`${tableName}\``,
                active: "Schemas",
              })}
              data-cy={`db-tables-schema-${tableName}-play`}
            >
              <Btn className={css.buttonIcon}>
                <MdPlayCircleOutline />
              </Btn>
            </Link>
          )}
        </span>
      </div>
    </li>
  );
}
