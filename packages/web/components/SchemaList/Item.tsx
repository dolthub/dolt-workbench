import Btn from "@components/Btn";
import Link from "@components/links/Link";
import { RefParams } from "@lib/params";
import { sqlQuery } from "@lib/urls";
import { RiBookOpenLine } from "@react-icons/all-files/ri/RiBookOpenLine";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  name: string;
  params: RefParams;
  isActive: boolean;
  query: string;
};

export default function Item({ name, params, isActive, query }: Props) {
  return (
    <li
      className={cx(css.item, {
        [css.selected]: isActive,
      })}
      data-cy={`db-schemas-${name}`}
      id={name}
    >
      <Link
        {...sqlQuery({ ...params, q: query, active: "Schemas" })}
        data-cy={`db-schemas-${name}-play`}
      >
        <Btn className={css.button}>
          <span className={css.name}>{name}</span>
          <span className={isActive ? css.viewing : css.icon}>
            {isActive ? "Viewing" : <RiBookOpenLine />}
          </span>
        </Btn>
      </Link>
    </li>
  );
}
