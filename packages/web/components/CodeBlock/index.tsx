import Btn from "@components/Btn";
import useDelay from "@hooks/useDelay";
import { FaRegClone } from "@react-icons/all-files/fa/FaRegClone";
import cx from "classnames";
import { ReactNode } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import css from "./index.module.css";

type Props = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

export default function CodeBlock({
  children,
  className,
  disabled = false,
}: Props) {
  return (
    <div className={cx(css.code, { [css.disabled]: disabled }, className)}>
      {children}
    </div>
  );
}

type CopyProps = {
  textToCopy: string;
  children?: ReactNode;
  className?: string;
  ["data-cy"]?: string;
  disabled?: boolean;
};

function WithCopyButton(props: CopyProps) {
  const copySuccess = useDelay();
  return (
    <CodeBlock
      disabled={props.disabled}
      className={cx(css.withCopy, props.className)}
    >
      <div data-cy={props["data-cy"]}>
        <pre>
          <code>
            {copySuccess.active
              ? "Copied to clipboard"
              : props.children ?? props.textToCopy}
          </code>
        </pre>
        {!props.disabled && (
          <CopyToClipboard text={props.textToCopy} onCopy={copySuccess.start}>
            <Btn className={css.clipboard}>
              <FaRegClone />
            </Btn>
          </CopyToClipboard>
        )}
      </div>
    </CodeBlock>
  );
}

CodeBlock.WithCopyButton = WithCopyButton;
