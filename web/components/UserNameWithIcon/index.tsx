import excerpt from "@lib/excerpt";
import cx from "classnames";
import css from "./index.module.css";

const EXCERPT_LENGTH = 15;

type Props = {
  hideUsername?: boolean;
  username: string;
  className?: string;
  showExcerptName?: boolean;
};

export default function UserNameWithIcon(props: Props) {
  const firstLetter = props.username[0].toUpperCase();
  return (
    <span className={props.className}>
      <span
        className={cx(css.icon, css[firstLetter])}
        aria-label="username letter"
      >
        {firstLetter}
      </span>
      {!props.hideUsername && (
        <span className={css.username}>
          {props.showExcerptName
            ? excerpt(props.username || "", EXCERPT_LENGTH)
            : props.username}
        </span>
      )}
    </span>
  );
}
