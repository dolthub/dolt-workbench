import Navbar from "@components/Navbar";
import cx from "classnames";
import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function MainLayout(props: Props) {
  return (
    <div className={css.layout}>
      <Navbar />
      <main className={cx(css.container, props.className)}>
        {props.children}
      </main>
      <footer>Apache 2.0 License</footer>
    </div>
  );
}
