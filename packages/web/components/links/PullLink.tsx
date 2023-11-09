import { PullParams } from "@lib/params";
import { pulls } from "@lib/urls";
import { ReactNode } from "react";
import Link, { LinkProps } from "./Link";

type Props = LinkProps & {
  children: ReactNode;
  params: PullParams;
};

export default function PullLink({ children, ...props }: Props) {
  return (
    <Link {...props} {...pulls(props.params)}>
      {children}
    </Link>
  );
}
