import { DocParams } from "@lib/params";
import { doc } from "@lib/urls";
import { ReactNode } from "react";
import Link, { LinkProps } from "./Link";

type Props = LinkProps & {
  children: ReactNode;
  params: DocParams;
};

export default function DocLink({ children, ...props }: Props) {
  return (
    <Link {...props} {...doc(props.params)}>
      {children}
    </Link>
  );
}
