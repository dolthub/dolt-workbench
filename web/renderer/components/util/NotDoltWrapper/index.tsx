import { ErrorMsg, Loader } from "@dolthub/react-components";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import React, { ReactElement } from "react";
import NotDoltMsg from "./NotDoltMsg";

type Props = {
  children: ReactElement<{ doltDisabled?: boolean }>;
  showNotDoltMsg?: boolean;
  feature?: string;
  className?: string;
  bigMsg?: boolean;
  hideNotDolt?: boolean;
  loader?: ReactElement;
};

export default function NotDoltWrapper(props: Props) {
  const res = useDatabaseDetails();
  if (res.loading && !res.hasData) {
    return props.loader ?? <Loader loaded={false} />;
  }
  if (res.error) return <ErrorMsg err={res.error} />;
  if (res.isDolt) {
    return props.children;
  }
  if (props.hideNotDolt) {
    return false;
  }
  if (props.showNotDoltMsg) {
    return (
      <NotDoltMsg
        feature={props.feature}
        className={props.className}
        big={props.bigMsg}
      />
    );
  }
  if (res.disableDoltFeature) {
    return React.cloneElement(props.children, { doltDisabled: true });
  }
  return <div />;
}
