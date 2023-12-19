import cx from "classnames";
import Breadcrumb from "./Breadcrumb";
import css from "./index.module.css";
import { BreadcrumbDetails, BreadcrumbType } from "./types";
import useCurrentDB from "./useCurrentDB";

type Props = {
  breadcrumbs: (currentDB?: string) => BreadcrumbDetails[];
  ["aria-label"]?: string;
  ["data-cy"]?: string;
  className?: string;
};

export default function Breadcrumbs(props: Props) {
  const currentDB = useCurrentDB();
  const breadcrumbs = props.breadcrumbs(currentDB);
  const last = breadcrumbs.length - 1;
  return (
    <div
      aria-label={props["aria-label"]}
      data-cy={props["data-cy"]}
      className={cx(css.crumbs, props.className)}
    >
      {breadcrumbs.map((crumb, curr) => {
        const isNotLast = curr < last;
        const nextNotButton = isNotLast
          ? breadcrumbs[curr + 1].type !== BreadcrumbType.Button
          : true;
        return (
          <Breadcrumb
            key={crumb.name}
            showDivider={isNotLast && nextNotButton}
            breadcrumb={crumb}
          />
        );
      })}
    </div>
  );
}
