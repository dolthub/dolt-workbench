import Link from "@components/links/Link";
import { Route } from "@lib/urlUtils";
import { IoIosArrowDropleftCircle } from "@react-icons/all-files/io/IoIosArrowDropleftCircle";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  url: Route;
  pageName: string;
  isMobile?: boolean;
  className?: string;
};

export default function GoBack(props: Props) {
  return (
    <div
      className={cx(
        css.goback,
        { [css.isMobile]: props.isMobile },
        props.className,
      )}
    >
      <Link {...props.url}>
        <IoIosArrowDropleftCircle />
        <span>back to {props.pageName}</span>
      </Link>
    </div>
  );
}
