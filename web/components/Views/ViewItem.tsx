import { useSqlEditorContext } from "@contexts/sqleditor";
import { Btn } from "@dolthub/react-components";
import { excerpt } from "@dolthub/web-utils";
import { SchemaItemFragment } from "@gen/graphql-types";
import useSqlBuilder from "@hooks/useSqlBuilder";
import { RefMaybeSchemaParams } from "@lib/params";
import { MdPlayCircleOutline } from "@react-icons/all-files/md/MdPlayCircleOutline";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  params: RefMaybeSchemaParams & { q?: string };
  view: SchemaItemFragment;
};

export default function ViewItem(props: Props) {
  const { selectFromTable } = useSqlBuilder();
  const { name } = props.view;
  const { queryClickHandler } = useSqlEditorContext("Views");
  const viewingQuery = isActive(name, props.params.q);
  const id = `view-${name}`;

  const executeView = async () => {
    const query = selectFromTable(name);
    await queryClickHandler({ ...props.params, query });
  };

  return (
    <li
      data-cy={`db-views-${id}`}
      className={cx(css.item, { [css.selected]: viewingQuery })}
    >
      <Btn onClick={executeView} className={css.button}>
        <span className={css.name}>{excerpt(name, 47)}</span>
        <span
          className={viewingQuery ? css.viewing : css.icon}
          data-cy={`db-views-view-button-${name}`}
        >
          {viewingQuery ? "Viewing" : <MdPlayCircleOutline />}
        </span>
      </Btn>
    </li>
  );
}

function isActive(name: string, activeQuery?: string): boolean {
  if (!activeQuery) return false;
  const lQuery = activeQuery.toLowerCase().trim();
  const lName = name.toLowerCase();
  const viewText = "select * from";
  return matchesDef(viewText, lName, lQuery);
}

function matchesDef(text: string, name: string, q: string): boolean {
  return (
    q === `${text} ${name}` ||
    q === `${text} \`${name}\`` ||
    q === `${text} "${name}"`
  );
}
