import DocsLink from "@components/links/DocsLink";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  feature?: string;
  className?: string;
  big?: boolean;
};

export default function NotDoltMsg(props: Props) {
  return (
    <div
      className={cx(css.container, { [css.big]: !!props.big }, props.className)}
    >
      {props.feature ? `${props.feature} is a Dolt feature and t` : "T"}his is
      not a Dolt database. To get started with database version control using
      Dolt, follow this <DocsLink>documentation</DocsLink>.
    </div>
  );
}
