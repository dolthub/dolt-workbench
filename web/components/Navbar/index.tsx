import DocsLink from "@components/links/DocsLink";
import ExternalLink from "@components/links/ExternalLink";
import Link from "@components/links/Link";
import { AiOutlineClose } from "@react-icons/all-files/ai/AiOutlineClose";
import { FaDocker } from "@react-icons/all-files/fa/FaDocker";
import { FaGithub } from "@react-icons/all-files/fa/FaGithub";
import Btn from "../Btn";
import css from "./index.module.css";

type Props = {
  home?: boolean;
};

export default function Navbar(props: Props) {
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
          {!props.home && (
            <Link href="/" className={css.exit}>
              <Btn>
                <span className={css.closeIcon}>
                  <AiOutlineClose />
                </span>
                Exit
              </Btn>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
