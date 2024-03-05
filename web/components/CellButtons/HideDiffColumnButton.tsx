import { Button } from "@dolthub/react-components";
import css from "./index.module.css";

type Props = {
  onClick: () => void;
};

export default function HideDiffColumn(props: Props) {
  return (
    <Button.Link onClick={props.onClick} className={css.button}>
      Hide Column
    </Button.Link>
  );
}
