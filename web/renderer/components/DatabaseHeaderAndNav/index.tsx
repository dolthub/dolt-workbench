import { OptionalRefParams } from "@lib/params";
import { ReactNode } from "react";
import Full from "./Full";
import Small from "./Small";

type Props = {
  params: OptionalRefParams & { schemaName?: string };
  title?: string;
  initialTabIndex: number;
  breadcrumbs?: ReactNode;
  showSmall: boolean;
  setShowSmall: (s: boolean) => void;
  showHeaderDetails?: boolean;
};

export default function DatabaseHeaderAndNav(props: Props) {
  return (
    <>
      <Full {...props} />
      <Small {...props} />
    </>
  );
}
