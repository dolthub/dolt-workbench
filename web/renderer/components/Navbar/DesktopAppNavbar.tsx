import Link from "@components/links/Link";
import { Navbar } from "@dolthub/react-components";
import css from "./index.module.css";

const handleDoubleClick = () => {
  window.ipc.macTitlebarClicked();
};

export default function DesktopAppNavbar() {
  return (
    <div className={css.titlebar} onDoubleClick={handleDoubleClick}>
      <Navbar
        logo={<Logo />}
        leftLinks={<LeftLinks />}
        rightLinks={<div />}
        bgColor="bg-storm-600"
      />
    </div>
  );
}

function LeftLinks() {
  return (
    <div className={css.leftLinks}>
      <Link href="/connections">Connections</Link>
    </div>
  );
}

function Logo() {
  return (
    <Link href="/">
      <img src="/images/d-logo.png" alt="Dolt Workbench" />
    </Link>
  );
}
