import Link from "@components/links/Link";
import { Navbar } from "@dolthub/react-components";
import css from "./index.module.css";
import { DatabaseParams } from "@lib/params";
import ConnectionsAndDatabases from "@components/ConnectionsAndDatabases";

const handleDoubleClick = () => {
  window.ipc.macTitlebarClicked();
};

type Props = {
  params?: DatabaseParams;
};

export default function DesktopAppNavbar({ params }: Props) {
  return (
    <div className={css.titlebar} onDoubleClick={handleDoubleClick}>
      <Navbar
        logo={<Logo />}
        leftLinks={<LeftLinks params={params} />}
        rightLinks={<div />}
        bgColor="bg-storm-600"
      />
    </div>
  );
}

function LeftLinks({ params }: Props) {
  if (!params) {
    return <></>;
  }
  return (
    <div className={css.leftLinks}>
      <ConnectionsAndDatabases params={params} />
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
