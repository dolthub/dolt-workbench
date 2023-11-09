import cx from "classnames";
import Breadcrumb from "./Breadcrumb";
import css from "./index.module.css";
import { BreadcrumbDetails, BreadcrumbType } from "./types";

type Props = {
  breadcrumbs: BreadcrumbDetails[];
  ["aria-label"]?: string;
  ["data-cy"]?: string;
  className?: string;
};

export default function Breadcrumbs({ breadcrumbs, ...props }: Props) {
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
