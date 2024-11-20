import DocsLink from "@components/links/DocsLink";
import Link from "@components/links/Link";
import { ExternalLink, Navbar } from "@dolthub/react-components";
import { dockerHubRepo, workbenchGithubRepo } from "@lib/constants";
import { FaDocker } from "@react-icons/all-files/fa/FaDocker";
import { FaGithub } from "@react-icons/all-files/fa/FaGithub";
import DesktopAppNavbar from "./DesktopAppNavbar";

const forElectron = process.env.NEXT_PUBLIC_FOR_ELECTRON === "true";

export default function Nav() {
  return forElectron ? (
    <DesktopAppNavbar />
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
  return (
    <>
      <DocsLink>Documentation</DocsLink>
      <Link href="/connections">Connections</Link>
    </>
  );
}

function RightLinks() {
  return (
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
  return (
    <Link href="/">
      <img src="/images/dolt-workbench.png" alt="Dolt Workbench" />
    </Link>
  );
}
