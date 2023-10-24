import Btn from "@components/Btn";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { RowForViewsFragment } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { MdPlayCircleOutline } from "@react-icons/all-files/md/MdPlayCircleOutline";
import { RiBookOpenLine } from "@react-icons/all-files/ri/RiBookOpenLine";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  params: RefParams & { q?: string };
  view: RowForViewsFragment;
};

export default function ViewItem(props: Props) {
  const name = props.view.columnValues[1].displayValue;
  const { queryClickHandler } = useSqlEditorContext("Views");
  const { viewingQuery, viewingDef } = isActive(name, props.params.q);
  const id = `view-${name}`;

  const executeView = async () => {
    const query = `SELECT * FROM \`${name}\``;
    await queryClickHandler({ ...props.params, query });
  };

  const executeShowView = async () => {
    const query = `SHOW CREATE VIEW \`${name}\``;
    await queryClickHandler({ ...props.params, query });
  };

  return (
    <li
      data-cy={`db-views-${id}`}
      className={cx(css.item, { [css.selected]: viewingQuery })}
    >
      <Btn onClick={executeView} className={css.button}>
        <div className={css.name}>{name}</div>
        <div
          className={viewingQuery ? css.viewing : css.icon}
          data-cy={`db-views-view-button-${name}`}
        >
          {viewingQuery ? "Viewing" : <MdPlayCircleOutline />}
        </div>
      </Btn>
      <Btn
        onClick={executeShowView}
        data-tooltip-id="view-icon-tip"
        data-tooltip-content={`show${viewingDef ? "ing" : ""} definition`}
      >
        <div
          className={cx(css.icon, css.book, { [css.bookActive]: viewingDef })}
        >
          <RiBookOpenLine />
        </div>
      </Btn>
    </li>
  );
}

function isActive(
  name: string,
  activeQuery?: string,
): { viewingQuery: boolean; viewingDef: boolean } {
  if (!activeQuery) return { viewingDef: false, viewingQuery: false };
  const lQuery = activeQuery.toLowerCase().trim();
  const lName = name.toLowerCase();
  const viewText = "select * from";
  const defText = "show create view";
  return {
    viewingQuery: matchesDef(viewText, lName, lQuery),
    viewingDef: matchesDef(defText, lName, lQuery),
  };
}

function matchesDef(text: string, name: string, q: string): boolean {
  return q === `${text} ${name}` || q === `${text} \`${name}\``;
}
