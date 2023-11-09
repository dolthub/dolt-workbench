import Button from "@components/Button";
import useDelay from "@hooks/useDelay";
import { IoCopyOutline } from "@react-icons/all-files/io5/IoCopyOutline";
import cx from "classnames";
import CopyToClipboard from "react-copy-to-clipboard";
import css from "./index.module.css";

type Props = {
  text: string;
  mobileCopyQuery?: boolean;
};

export default function CopyButton({ text, mobileCopyQuery }: Props) {
  const success = useDelay(3000);
  return (
    <CopyToClipboard text={text} onCopy={success.start}>
      <Button
        className={cx(css.copy, { [css.mobileCopyQuery]: mobileCopyQuery })}
      >
        {mobileCopyQuery && <IoCopyOutline />}
        {success.active ? "Copied" : "Copy"}
      </Button>
    </CopyToClipboard>
  );
}
