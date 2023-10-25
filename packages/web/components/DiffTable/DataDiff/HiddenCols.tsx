import Btn from "@components/Btn";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import css from "./index.module.css";
import { HiddenColIndexes, SetHiddenColIndexes, unhideColumn } from "./utils";

type Props = {
  cols: ColumnForDataTableFragment[];
  hiddenColIndexes: HiddenColIndexes;
  setHiddenColIndexes: SetHiddenColIndexes;
  onClickUnchangedCols?: (i: number) => void;
};

export default function HiddenCols(props: Props) {
  return (
    <div className={css.hiddenContainer}>
      <div className={css.hiddenLabel}>{"Hidden columns:"}</div>
      <ol>
        {props.hiddenColIndexes.map(i => (
          <li key={i} className={css.hiddenCol}>
            <span>{props.cols[i].name}</span>
            <Btn
              onClick={() => {
                if (props.onClickUnchangedCols) {
                  props.onClickUnchangedCols(i);
                }
                unhideColumn(i, props.setHiddenColIndexes);
              }}
              aria-label={`unhide column ${props.cols[i].name}`}
            >
              <IoMdClose />
            </Btn>
          </li>
        ))}
      </ol>
    </div>
  );
}
