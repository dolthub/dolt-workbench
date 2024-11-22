import Navbar from "@components/Navbar";
import cx from "classnames";
import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  children: ReactNode;
  className?: string;
};

const forMacNav = process.env.NEXT_PUBLIC_FOR_MAC_NAV === "true";

export default function MainLayout(props: Props) {
  return (
    <div className={css.layout}>
      <Navbar />
      <main
        className={cx(css.container, props.className, {
          [css.forTallerNav]: forMacNav,
        })}
      >
        {props.children}
      </main>
      <footer>Apache 2.0 License</footer>
    </div>
  );
}
