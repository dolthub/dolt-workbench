import Button from "@components/Button";
import {
  CellStatusActionType,
  ColumnStatus,
  SetColumnStatus,
} from "@lib/tableTypes";
import css from "./index.module.css";

type Props = {
  columnStatus: ColumnStatus;
  setColumnStatus: SetColumnStatus;
  setShowDropdown: (s: boolean) => void;
  index: number;
  newStatus: CellStatusActionType;
};

export default function ChangeColumnStatusButton(props: Props) {
  const onClick = () => {
    props.setColumnStatus({
      ...props.columnStatus,
      [props.index]: props.newStatus,
    });
    props.setShowDropdown(false);
  };
  const buttonText = props.newStatus.replace("Cell", "Column");
  return (
    <div>
      <Button.Link onClick={onClick} className={css.button}>
        {buttonText}
      </Button.Link>
    </div>
  );
}
