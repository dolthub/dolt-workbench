import { ReactElement } from "react";

export enum BreadcrumbName {
  Database = "database",
}

export enum BreadcrumbType {
  Link = "link",
  Text = "text",
  Button = "button",
}

export type BreadcrumbProps = {
  key: string;
  ["data-cy"]: string;
  ["aria-label"]: string;
};

export type BreadcrumbDetails = {
  child: ReactElement;
  name: BreadcrumbName;
  type: BreadcrumbType;
};
