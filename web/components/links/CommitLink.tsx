import { CommitParams } from "@lib/params";
import { commit } from "@lib/urls";
import { ReactNode } from "react";
import Link, { LinkProps } from "./Link";

type Props = LinkProps & {
  children: ReactNode;
  params: CommitParams;
};

export default function CommitLink({ children, ...props }: Props) {
  return (
    <Link {...props} {...commit(props.params)}>
      {children}
    </Link>
  );
}
