import { Button } from "@dolthub/react-components";
import { useDelay } from "@dolthub/react-hooks";
import { getBitDisplayValue } from "@lib/dataTable";
import CopyToClipboard from "react-copy-to-clipboard";
import css from "./index.module.css";

type Props = {
  value: string;
  colType?: string;
  disabled?: boolean;
};

export default function CopyButton({
  value,
  colType,
  disabled,
}: Props): JSX.Element {
  const success = useDelay();
  const copyVal = colType === "bit(1)" ? getBitDisplayValue(value) : value;
  return (
    <CopyToClipboard onCopy={success.start} text={copyVal}>
      <Button.Link
        className={css.button}
        data-cy="copy-button"
        disabled={disabled}
      >
        {success.active ? "Copied" : "Copy Value"}
      </Button.Link>
    </CopyToClipboard>
  );
}
