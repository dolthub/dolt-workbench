import { useDoltDatabaseDetailsQuery } from "@gen/graphql-types";
import React, { ReactElement } from "react";
import QueryHandler from "../QueryHandler";
import NotDoltMsg from "./NotDoltMsg";

type Props = {
  children: ReactElement;
  showNotDoltMsg?: boolean;
  feature?: string;
};

export default function NotDoltWrapper(props: Props) {
  const res = useDoltDatabaseDetailsQuery();
  return (
    <QueryHandler
      result={res}
      render={data => {
        if (data.doltDatabaseDetails.isDolt) {
          return props.children;
        }
        if (props.showNotDoltMsg) {
          return <NotDoltMsg feature={props.feature} />;
        }
        if (!data.doltDatabaseDetails.hideDoltFeatures) {
          return React.cloneElement(props.children, { doltDisabled: true });
        }
        return <div />;
      }}
    />
  );
}
