import { OptionalRefParams } from "@lib/params";
import Full from "./Full";

type Props = {
  params: OptionalRefParams;
  title?: string;
  initialTabIndex: number;
};

export default function DatabaseHeaderAndNav(props: Props) {
  return <Full {...props} />;
}
