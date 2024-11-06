import Link from "@components/links/Link";
import { Button, Navbar } from "@dolthub/react-components";
import ResetConnectionButton from "@components/DatabaseHeaderAndNav/ResetConnectionButton";
import AddItemDropdown from "@components/DatabaseHeaderAndNav/AddItemDropdown";
import { DatabasePageParams } from "@lib/params";
import DatabaseBreadcrumbs from "@components/breadcrumbs/DatabaseBreadcrumbs";
import DatabaseTypeLabel from "@components/DatabaseTypeLabel";
import { useState } from "react";
import cx from "classnames";
import Connections from "./Connections";
import css from "./index.module.css";

const handleDoubleClick = () => {
  window.ipc.macTitlebarClicked();
};

type Props = {
  params?: DatabasePageParams;
};

export default function DesktopAppNavbar(props: Props) {
  return (
    <div className={css.titlebar} onDoubleClick={handleDoubleClick}>
      <Navbar
        logo={<Logo />}
        leftLinks={<LeftLinks {...props} />}
        rightLinks={<RightLinks {...props} />}
        bgColor="bg-storm-600"
      />
    </div>
  );
}

function LeftLinks(props: Props) {
  if (!props.params) return null;
  return (
    <div className={css.leftLinks}>
      <Connections />

      <DatabaseBreadcrumbs
        className={css.databaseBreadcrumbs}
        params={props.params}
        blueIcon
      />
      <DatabaseTypeLabel className={css.permission} />
    </div>
  );
}

function RightLinks({ params }: Props) {
  const [toggle, setToggle] = useState(false);
  const toggleLeftSidebar = () => {
    setToggle(!toggle);
    window.ipc.invoke("toggle-left-sidebar");
  };
  if (!params) return null;

  return (
    <div className={css.rightButtons}>
      <ResetConnectionButton />
      <AddItemDropdown params={params} />
      <div className={css.toggleActions}>
        <div className={cx(css.toggleLeft, { [css.collapsed]: toggle })}>
          <Button.Link onClick={toggleLeftSidebar} />
        </div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <Link href="/">
      <img src="/images/dolt-workbench.png" alt="Dolt Workbench" />
    </Link>
  );
}
