import { cloneElement } from "react";
import { BreadcrumbDetails } from "../types";
import { getBreadcrumbProps } from "../utils";
import css from "./index.module.css";

type Props = {
  breadcrumb: BreadcrumbDetails;
  showDivider?: boolean;
};

export default function Breadcrumb({ breadcrumb, showDivider = false }: Props) {
  return (
    <div className={css[breadcrumb.type]}>
      {cloneElement(breadcrumb.child, getBreadcrumbProps(breadcrumb))}
      {showDivider && <span> / </span>}
    </div>
  );
}
