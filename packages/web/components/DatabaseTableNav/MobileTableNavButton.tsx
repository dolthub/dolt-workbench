import Btn from "@dsw/components/Btn";
import { GiHamburgerMenu } from "@react-icons/all-files/gi/GiHamburgerMenu";
import css from "./index.module.css";

type Props = {
  showTableNav: boolean;
  setShowTableNav: (s: boolean) => void;
};

export default function MobileTableNavButton({
  showTableNav,
  setShowTableNav,
}: Props) {
  return showTableNav ? (
    <Btn
      className={css.tableNavTrigger}
      onClick={() => setShowTableNav(false)}
      data-cy="close-table-nav-button"
    >
      <span>&#10005;</span>
    </Btn>
  ) : (
    <Btn
      className={css.tableNavTrigger}
      onClick={() => setShowTableNav(true)}
      data-cy="show-table-nav-button"
    >
      <GiHamburgerMenu />
    </Btn>
  );
}
