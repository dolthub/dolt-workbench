import Loader from "@components/Loader";
import Navbar from "@components/Navbar";
import { useCurrentDatabaseQuery } from "@gen/graphql-types";
import useHotKeys from "@hooks/useHotKeys";
import { gqlDatabaseNotFoundErr } from "@lib/errors/graphql";
import { errorMatches } from "@lib/errors/helpers";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { GlobalHotKeys } from "react-hotkeys";
import css from "./index.module.css";

type Props = {
  children: ReactNode;
};

function Inner(props: Props) {
  const router = useRouter();
  const res = useCurrentDatabaseQuery();
  if (res.loading) {
    return <Loader loaded={false} />;
  }
  if (res.error && errorMatches(gqlDatabaseNotFoundErr, res.error)) {
    router.push("/").catch(console.error);
    return <Loader loaded={false} />;
  }
  return props.children;
}

export default function DatabaseLayoutWrapper(props: Props) {
  const { keyMap, handlers } = useHotKeys();
  return (
    <div className={css.appLayout}>
      <Navbar />
      <GlobalHotKeys keyMap={keyMap} handlers={handlers} />
      <div className={css.layoutWrapperContainer}>
        <Inner>{props.children}</Inner>
      </div>
    </div>
  );
}
