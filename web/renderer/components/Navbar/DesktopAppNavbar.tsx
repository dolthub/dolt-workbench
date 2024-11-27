import { DatabaseParams } from "@lib/params";
import ConnectionsAndDatabases from "@components/ConnectionsAndDatabases";
import Link from "@components/links/Link";
import { useState } from "react";
import cx from "classnames";
import css from "./index.module.css";

const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
  if (e.currentTarget === e.target) {
    window.ipc.macTitlebarClicked();
  }
};

type Props = {
  params?: DatabaseParams;
};

export default function DesktopAppNavbar({ params }: Props) {
  const [noDrag, setNoDrag] = useState(false);

  return (
    <div
      className={cx(css.titlebar, {
        [css.drag]: !noDrag,
        [css.noDrag]: noDrag,
      })}
      onDoubleClick={handleDoubleClick}
    >
      {params ? (
        <ConnectionsAndDatabases params={params} setNoDrag={setNoDrag} />
      ) : (
        <Logo />
      )}
    </div>
  );
}

export function Logo() {
  return (
    <Link href="/">
      <img
        src="/images/dolt-workbench.png"
        alt="Dolt Workbench"
        className={css.logo}
      />
    </Link>
  );
}
