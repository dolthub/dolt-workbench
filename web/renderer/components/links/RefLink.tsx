import { RefParams } from "@lib/params";
import { ref } from "@lib/urls";
import { ReactNode } from "react";
import Link, { LinkProps } from "./Link";

type Props = LinkProps & {
  children: ReactNode;
  params: RefParams;
};

export default function RefLink({ children, ...props }: Props) {
  return (
    <Link {...props} {...ref(props.params)}>
      {children}
    </Link>
  );
}
