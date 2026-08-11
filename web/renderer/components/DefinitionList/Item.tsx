import Link from "@components/links/Link";
import { Btn } from "@dolthub/react-components";
import { excerpt } from "@dolthub/web-utils";
import { SchemaType } from "@gen/graphql-types";
import { encodeDefinition } from "@lib/definitionUrl";
import { RefOptionalSchemaParams } from "@lib/params";
import { query as queryRoute } from "@lib/urls";
import { RiBookOpenLine } from "@react-icons/all-files/ri/RiBookOpenLine";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  name: string;
  kind: SchemaType;
  params: RefOptionalSchemaParams;
  isActive: boolean;
};

export default function Item({ name, kind, params, isActive }: Props) {
  const baseRoute = queryRoute(params);
  const pushQuery = {
    ...encodeDefinition({ name, kind, schemaName: params.schemaName }),
    active: "Definitions",
  };
  return (
    <li
      className={cx(css.item, {
        [css.selected]: isActive,
      })}
      data-cy={`db-defs-${name}`}
      id={name}
    >
      <Link
        href={{ pathname: baseRoute.hrefPathname(), query: pushQuery }}
        as={{ pathname: baseRoute.asPathname(), query: pushQuery }}
        data-cy={`db-defs-${name}-play`}
      >
        <Btn className={css.button}>
          <span className={css.name}>{excerpt(name, 45)}</span>
          <span className={isActive ? css.viewing : css.icon}>
            {isActive ? "viewing" : <RiBookOpenLine />}
          </span>
        </Btn>
      </Link>
    </li>
  );
}
