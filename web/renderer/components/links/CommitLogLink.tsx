import { RefParams } from "@lib/params";
import { commitLog } from "@lib/urls";
import { ReactNode } from "react";
import Link, { LinkProps } from "./Link";

type Props = LinkProps & {
  children: ReactNode;
  params: RefParams;
  commitId?: string;
};

export default function CommitLogLink({ children, ...props }: Props) {
  return (
    <Link
      {...props}
      {...commitLog({ ...props.params, commitId: props.commitId })}
    >
      {children}
    </Link>
  );
}
