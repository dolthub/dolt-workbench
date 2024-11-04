import DocsLink from "@components/links/DocsLink";
import Link from "@components/links/Link";
import { ExternalLink, Navbar } from "@dolthub/react-components";
import { dockerHubRepo, workbenchGithubRepo } from "@lib/constants";
import { FaDocker } from "@react-icons/all-files/fa/FaDocker";
import { FaGithub } from "@react-icons/all-files/fa/FaGithub";
import css from "./index.module.css";

const forElectron = process.env.NEXT_PUBLIC_FOR_ELECTRON === "true";

const handleDoubleClick = () => {
  window.ipc.macTitlebarClicked();
};

export default function Nav() {
  return forElectron ? (
    <div className={css.titlebar} onDoubleClick={handleDoubleClick}>
      <Navbar
        logo={<Logo />}
        leftLinks={<LeftLinks />}
        rightLinks={<RightLinks />}
        bgColor="bg-storm-600"
      />
    </div>
  ) : (
    <Navbar
      logo={<Logo />}
      leftLinks={<LeftLinks />}
      rightLinks={<RightLinks />}
      bgColor="bg-storm-600"
    />
  );
}

function LeftLinks() {
  return forElectron ? (
    <div className={css.leftLinks}>
      <Link href="/connections">Connections</Link>
    </div>
  ) : (
    <>
      <DocsLink>Documentation</DocsLink>
      <Link href="/connections">Connections</Link>
    </>
  );
}

function RightLinks() {
  return forElectron ? (
    <>
      <ExternalLink href={workbenchGithubRepo}>
        <FaGithub /> GitHub
      </ExternalLink>
      <DocsLink>Documentation</DocsLink>
    </>
  ) : (
    <>
      <ExternalLink href={workbenchGithubRepo}>
        <FaGithub /> GitHub
      </ExternalLink>
      <ExternalLink href={dockerHubRepo}>
        <FaDocker /> Docker Hub
      </ExternalLink>
    </>
  );
}

function Logo() {
  return forElectron ? (
    <img src="/images/dolt-workbench.png" alt="Dolt Workbench" />
  ) : (
    <Link href="/">
      <img src="/images/dolt-workbench.png" alt="Dolt Workbench" />
    </Link>
  );
}
