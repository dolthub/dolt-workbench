import { Button } from "@dolthub/react-components";
import { CellStatusActionType, SetCellStatusAction } from "@lib/tableTypes";
import css from "./index.module.css";

type Props = {
  setCellStatus: SetCellStatusAction;
  setShowDropdown: (s: boolean) => void;
  statusAction: CellStatusActionType;
};

export default function ChangeCellStatusButton(props: Props) {
  const onClick = () => {
    props.setCellStatus(props.statusAction);
    props.setShowDropdown(false);
  };

  return (
    <Button.Link onClick={onClick} className={css.button}>
      {props.statusAction}
    </Button.Link>
  );
}
