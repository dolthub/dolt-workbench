import DocsLink from "@components/links/DocsLink";
import Link from "@components/links/Link";
import { AiOutlineClose } from "@react-icons/all-files/ai/AiOutlineClose";
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
        </div>

        <div>
          <Link href="/" className={css.workbenchLogoLink}>
            <img src="/images/dolt-workbench.png" alt="Dolt Workbench" />
          </Link>
        </div>

        <div className={css.right}>
          {!props.home && (
            <Link href="/" className={css.exit}>
              <Btn>
                Exit
                <span className={css.closeIcon}>
                  <AiOutlineClose />
                </span>
              </Btn>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
