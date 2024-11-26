import DocsLink from "@components/links/DocsLink";
import Link from "@components/links/Link";
import { ExternalLink, Navbar } from "@dolthub/react-components";
import { dockerHubRepo, workbenchGithubRepo } from "@lib/constants";
import { FaDocker } from "@react-icons/all-files/fa/FaDocker";
import { FaGithub } from "@react-icons/all-files/fa/FaGithub";
import { DatabaseParams } from "@lib/params";
import DesktopAppNavbar, { Logo } from "./DesktopAppNavbar";

// TODO: Support desktop app nav bar on windows
const forMacNav = process.env.NEXT_PUBLIC_FOR_MAC_NAV === "true";

type Props = {
  params?: DatabaseParams;
};

export default function Nav({ params }: Props) {
  return forMacNav ? (
    <DesktopAppNavbar params={params} />
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
