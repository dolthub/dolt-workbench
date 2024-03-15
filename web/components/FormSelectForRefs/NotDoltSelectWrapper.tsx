import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { Maybe } from "@dolthub/web-utils";
import { ReactNode } from "react";
import DoltDisabledSelector from "./DoltDisabledSelector";

type Props = {
  children: ReactNode;
  val: Maybe<string>;
};

type InnerProps = Props & {
  doltDisabled?: boolean;
};

function Inner(props: InnerProps) {
  return props.doltDisabled ? (
    <DoltDisabledSelector val={props.val} />
  ) : (
    props.children
  );
}

export default function NotDoltSelectWrapper(props: Props) {
  return (
    <NotDoltWrapper>
      <Inner val={props.val}>{props.children}</Inner>
    </NotDoltWrapper>
  );
}
