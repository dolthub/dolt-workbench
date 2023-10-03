import Full from "./Full";

type Props = {
  params: { refName?: string };
  title?: string;
  initialTabIndex: number;
};

export default function DatabaseHeaderAndNav(props: Props) {
  return <Full {...props} />;
}
