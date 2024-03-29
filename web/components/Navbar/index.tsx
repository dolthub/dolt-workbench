import DocsLink from "@components/links/DocsLink";
import Link from "@components/links/Link";
import { ExternalLink, Navbar } from "@dolthub/react-components";
import { dockerHubRepo, workbenchGithubRepo } from "@lib/constants";
import { FaDocker } from "@react-icons/all-files/fa/FaDocker";
import { FaGithub } from "@react-icons/all-files/fa/FaGithub";

export default function Nav() {
  return (
    <Navbar
      logo={<Logo />}
      leftLinks={<LeftLinks />}
      rightLinks={<RightLinks />}
      bgColor="bg-ld-darkerblue"
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
