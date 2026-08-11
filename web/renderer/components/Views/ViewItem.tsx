import Link from "@components/links/Link";
import { excerpt } from "@dolthub/web-utils";
import { SchemaItemFragment } from "@gen/graphql-types";
import { RefOptionalSchemaParams } from "@lib/params";
import { MdPlayCircleOutline } from "react-icons/md";
import { table } from "@lib/urls";
import { useRouter } from "next/router";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  params: RefOptionalSchemaParams & { q?: string };
  view: SchemaItemFragment;
};

export default function ViewItem(props: Props) {
  const router = useRouter();
  const { name } = props.view;
  const viewingQuery = isViewing(router.query.tableName, name);
  const id = `view-${name}`;
  const route = table({ ...props.params, tableName: name });

  return (
    <li
      data-cy={`db-views-${id}`}
      className={cx(css.item, { [css.selected]: viewingQuery })}
    >
      <Link {...route} className={css.button}>
        <span className={css.name}>{excerpt(name, 47)}</span>
        <span
          className={viewingQuery ? css.viewing : css.icon}
          data-cy={`db-views-view-button-${name}`}
        >
          {viewingQuery ? "viewing" : <MdPlayCircleOutline />}
        </span>
      </Link>
    </li>
  );
}

function isViewing(
  tableNameParam: string | string[] | undefined,
  name: string,
): boolean {
  if (typeof tableNameParam !== "string") return false;
  const decoded = decodeURIComponent(tableNameParam);
  return decoded === name || decoded.endsWith(`.${name}`);
}
