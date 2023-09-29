import Navbar from "@components/Navbar";
import useHotKeys from "@hooks/useHotKeys";
import { ReactNode } from "react";
import { GlobalHotKeys } from "react-hotkeys";
import css from "./index.module.css";

type Props = {
  children: ReactNode;
};

export default function DatabaseLayoutWrapper(props: Props) {
  const { keyMap, handlers } = useHotKeys();
  return (
    <div className={css.appLayout}>
      <Navbar />
      <GlobalHotKeys keyMap={keyMap} handlers={handlers} />
      <div className={css.layoutWrapperContainer}>{props.children}</div>
    </div>
  );
}
