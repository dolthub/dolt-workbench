import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { Maybe } from "@dolthub/web-utils";
import DoltDisabledSelector from "./DoltDisabledSelector";

type Props = {
  children: JSX.Element;
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
