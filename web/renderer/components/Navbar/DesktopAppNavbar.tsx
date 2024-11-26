import { DatabaseParams } from "@lib/params";
import ConnectionsAndDatabases from "@components/ConnectionsAndDatabases";
import Link from "@components/links/Link";
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
      {params ? <ConnectionsAndDatabases params={params} /> : <Logo />}
    </div>
  );
}

export function Logo() {
  return (
    <Link href="/">
      <img src="/images/dolt-workbench.png" alt="Dolt Workbench" />
    </Link>
  );
}
