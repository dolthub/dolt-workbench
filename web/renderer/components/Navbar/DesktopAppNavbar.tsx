import Link from "@components/links/Link";
import { Navbar } from "@dolthub/react-components";
import { DatabaseParams } from "@lib/params";
import ConnectionsAndDatabases from "@components/ConnectionsAndDatabases";
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
  return (
    <div className={css.titlebar} onDoubleClick={handleDoubleClick}>
      <Navbar
        logo={<Logo />}
        leftLinks={<LeftLinks params={params} />}
        rightLinks={
          <div className={css.forMobile}>
            <Link href="/connections">Connections</Link>
          </div>
        }
        bgColor="bg-storm-600"
        large
      />
    </div>
  );
}

function LeftLinks({ params }: Props) {
  return (
    <div className={css.leftLinks}>
      {params ? (
        <ConnectionsAndDatabases params={params} />
      ) : (
        <Link href="/connections">Connections</Link>
      )}
    </div>
  );
}

function Logo() {
  return (
    <Link href="/" className={css.dLogo}>
      <img
        src="/images/d-logo.png"
        alt="Dolt Workbench"
        width={32}
        height={32}
      />
    </Link>
  );
}
