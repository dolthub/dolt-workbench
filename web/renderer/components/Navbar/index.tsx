import { DatabaseParams } from "@lib/params";
import ConnectionsAndDatabases from "@components/ConnectionsAndDatabases";
import Link from "@components/links/Link";
import { useState } from "react";
import cx from "classnames";
import { dockerHubRepo, workbenchGithubRepo } from "@lib/constants";
import { ExternalLink, MobileNavbar } from "@dolthub/react-components";
import { FaGithub } from "@react-icons/all-files/fa/FaGithub";
import { FaDocker } from "@react-icons/all-files/fa/FaDocker";
import DocsLink from "@components/links/DocsLink";
import css from "./index.module.css";

// TODO: Support desktop app nav bar on windows
const forMacNav = process.env.NEXT_PUBLIC_FOR_MAC_NAV === "true";

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
        [css.center]: !params,
      })}
      onDoubleClick={handleDoubleClick}
    >
      {params ? (
        <Inner params={params} setNoDrag={setNoDrag} />
      ) : (
        <Logo imgSrc="/images/dolt-workbench.png" />
      )}
      <MobileNavbar logo={<Logo imgSrc="/images/dolt-workbench.png" />}>
      <RightLinks />
      </MobileNavbar>
    </div>
  );
}

type InnerProps = {
  params: DatabaseParams;
  setNoDrag: (noDrag: boolean) => void;
};

function Inner({ params, setNoDrag }: InnerProps) {
  if (forMacNav) {
    return (
      <div className={css.outer}>
        <ConnectionsAndDatabases params={params} setNoDrag={setNoDrag} />
        <Logo imgSrc="/images/dolt-workbench-grey.png" />
      </div>
    );
  }
  return (
    <div className={css.desktopOuter}>
      <Logo imgSrc="/images/dolt-workbench.png" className={css.left} />
      <ConnectionsAndDatabases params={params} className={css.middle} />
      <RightLinks />
    </div>
  );
}

type LogoProps = {
  imgSrc: string;
  className?: string;
};

export function Logo({ imgSrc, className }: LogoProps) {
  return (
    <Link href="/" className={cx(className)}>
      <img src={imgSrc} alt="Dolt Workbench" className={css.logo} />
    </Link>
  );
}
function RightLinks() {
  return (
    <div className={css.right}>
      <DocsLink>Documentation</DocsLink>
      <ExternalLink href={workbenchGithubRepo}>
        <FaGithub /> GitHub
      </ExternalLink>
      <ExternalLink href={dockerHubRepo}>
        <FaDocker /> Docker Hub
      </ExternalLink>
    </div>
  );
}
