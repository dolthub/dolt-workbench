import DocsLink from "@components/links/DocsLink";
import css from "./index.module.css";

type Props = {
  feature?: string;
};

export default function NotDoltMsg(props: Props) {
  return (
    <div className={css.container}>
      {props.feature ? `${props.feature} is a Dolt feature and t` : "T"}his is
      not a Dolt database. To get started with database version control using
      Dolt, follow this <DocsLink>documentation</DocsLink>.
    </div>
  );
}
