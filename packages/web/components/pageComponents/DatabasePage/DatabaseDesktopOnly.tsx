import { useReactiveWidth } from "@hooks/useReactiveSize";
import { DatabaseParams } from "@lib/params";
import { ReactElement, ReactNode } from "react";
import ForDefaultBranch from "./ForDefaultBranch";

type Props = {
  children: ReactNode;
  title?: string;
  params: DatabaseParams & {
    refName?: string;
    active?: string;
    edit?: boolean;
  };
};

export default function DatabaseDesktopOnly(props: Props): ReactElement {
  // Used for database pages that cannot be viewed on mobile
  const { isMobile } = useReactiveWidth();
  return (
    <div>
      {!isMobile ? (
        props.children
      ) : (
        <ForDefaultBranch params={props.params} title={props.title} />
      )}
    </div>
  );
}
