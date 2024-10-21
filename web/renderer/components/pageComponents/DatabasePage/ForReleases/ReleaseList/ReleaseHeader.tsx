import { TagForListFragment } from "@gen/graphql-types";
import css from "./index.module.css";

type Props = {
  tag: TagForListFragment; // latest release
  prevTag?: TagForListFragment; // tag that comes before latest release
};

export default function ReleaseHeader(props: Props) {
  const date = new Date(props.tag.taggedAt);
  const prevDate = props.prevTag && new Date(props.prevTag.taggedAt);

  const shouldShowHeader =
    !props.prevTag || formatLongDate(date) !== formatLongDate(prevDate);
  if (shouldShowHeader) {
    return (
      <li className={css.header} data-cy="release-list-header">
        <span className={css.bullet} />
        {formatLongDate(date)}
      </li>
    );
  }
  return null;
}

export function formatLongDate(d: Date | undefined): string {
  if (!d) {
    return "";
  }
  const month = d.toLocaleString("default", { month: "long" });
  return `${month} ${d.getDate()}, ${d.getFullYear()}`;
}
