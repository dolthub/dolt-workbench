import cx from "classnames";
import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  children?: ReactNode;
  className?: string;
  padded?: boolean;
  imgSrc?: string;
  refetch?: () => Promise<void>;
  tab: number;
};

// TODO: refetch section query on open
export default function Section({ padded = false, ...props }: Props) {
  return (
    <section className={cx(css.section, props.className)}>
      <div className={cx({ [css.padded]: padded })}>{props.children}</div>
    </section>
  );
}
