import { useReactiveWidth } from "@dolthub/react-hooks";
import { OptionalRefParams } from "@lib/params";
import { RefUrl, database } from "@lib/urls";
import { ReactElement, ReactNode } from "react";
import ForDefaultBranch from "./ForDefaultBranch";

type Props = {
  children: ReactNode;
  title?: string;
  params: OptionalRefParams & {
    active?: string;
    edit?: boolean;
  };
  routeRefChangeTo?: RefUrl;
};

export default function DatabaseDesktopOnly(props: Props): ReactElement {
  // Used for database pages that cannot be viewed on mobile
  const { isMobile } = useReactiveWidth();
  return (
    <div>
      {!isMobile ? (
        props.children
      ) : (
        <ForDefaultBranch
          params={props.params}
          title={props.title}
          routeRefChangeTo={props.routeRefChangeTo ?? database}
        />
      )}
    </div>
  );
}
