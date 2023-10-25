import { DatabaseParams } from "@lib/params";
import { database } from "@lib/urls";
import { ReactNode } from "react";
import Link, { LinkProps } from "./Link";

type Props = LinkProps & {
  children: ReactNode;
  params: DatabaseParams;
};

export default function DatabaseLink({ children, ...props }: Props) {
  return (
    <Link {...props} {...database(props.params)}>
      {children}
    </Link>
  );
}
