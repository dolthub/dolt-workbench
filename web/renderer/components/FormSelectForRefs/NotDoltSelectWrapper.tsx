import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { Maybe } from "@dolthub/web-utils";
import DoltDisabledSelector from "./DoltDisabledSelector";

type Props = {
  children: JSX.Element;
  val: Maybe<string>;
  showLabel?: boolean;
};

type InnerProps = Props & {
  doltDisabled?: boolean;
};

function Inner({ children, ...props }: InnerProps) {
  return props.doltDisabled ? <DoltDisabledSelector {...props} /> : children;
}

export default function NotDoltSelectWrapper(props: Props) {
  return (
    <NotDoltWrapper>
      <Inner {...props}>{props.children}</Inner>
    </NotDoltWrapper>
  );
}
