import DocsLink from "@components/links/DocsLink";
import ExternalLink from "@components/links/ExternalLink";
import Link from "@components/links/Link";
import { FaDocker } from "@react-icons/all-files/fa/FaDocker";
import { FaGithub } from "@react-icons/all-files/fa/FaGithub";
import css from "./index.module.css";

export default function Navbar() {
  return (
    <div className={css.container}>
      <div className={css.inner}>
        <div className={css.left}>
          <DocsLink className={css.link}>Documentation</DocsLink>
          <Link className={css.link} href="/connections">
            Connections
          </Link>
        </div>

        <div>
          <Link href="/" className={css.workbenchLogoLink}>
            <img src="/images/dolt-workbench.png" alt="Dolt Workbench" />
          </Link>
        </div>

        <div className={css.right}>
          <div className={css.hubLinks}>
            <ExternalLink
              href="https://github.com/dolthub/dolt-workbench"
              className={css.link}
            >
              <FaGithub /> GitHub
            </ExternalLink>
            <ExternalLink
              href="https://hub.docker.com/r/dolthub/dolt-workbench"
              className={css.link}
            >
              <FaDocker /> Docker Hub
            </ExternalLink>
          </div>
        </div>
      </div>
    </div>
  );
}
