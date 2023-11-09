import Button from "@components/Button";
import ErrorMsg from "@components/ErrorMsg";
import { ApolloErrorType } from "@lib/errors/types";
import cx from "classnames";
import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  onCancel?: () => void;
  error?: ApolloErrorType;
  children: ReactNode;
  className?: string;
  left?: boolean;
  stackedButton?: boolean;
  ["data-cy"]?: string;
};

export default function ButtonsWithError({
  children,
  onCancel,
  error,
  className,
  left = false,
  stackedButton = false,
  ...props
}: Props) {
  return (
    <div className={className} aria-label="buttons-with-error">
      <Button.Group
        className={cx(
          css.group,
          { [css.left]: left },
          { [css.stackedButton]: stackedButton },
        )}
        data-cy={props["data-cy"]}
      >
        {children}
        {onCancel && (
          <Button.Link
            onClick={onCancel}
            data-cy="cancel-button"
            className={css.cancel}
          >
            cancel
          </Button.Link>
        )}
      </Button.Group>
      <ErrorMsg className={cx(css.error, { [css.left]: left })} err={error} />
    </div>
  );
}
