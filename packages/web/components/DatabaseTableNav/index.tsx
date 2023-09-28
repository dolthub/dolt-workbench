import { GiHamburgerMenu } from "@react-icons/all-files/gi/GiHamburgerMenu";
import cx from "classnames";
import { useState } from "react";
import MobileTableNavButton from "./MobileTableNavButton";
import NavLinks from "./NavLinks";
import css from "./index.module.css";

type Params = {
  tableName?: string;
  q?: string;
};

type NavProps = {
  params: Params;
  initiallyOpen?: boolean;
  isMobile?: boolean;
};

type Props = NavProps & {
  showTableNav: boolean;
  setShowTableNav: (s: boolean) => void;
};

function Nav({ params, initiallyOpen = false, isMobile = false }: NavProps) {
  const [open, setOpen] = useState(initiallyOpen || isInitiallyOpen(params));
  const toggleMenu = () => {
    setOpen(!open);
  };

  return (
    <div
      className={cx(
        css.container,
        { [css.openContainer]: open },
        { [css.closedContainer]: !open },
        { [css.showForMobile]: isMobile },
      )}
    >
      <div className={css.top}>
        <GiHamburgerMenu onClick={toggleMenu} className={css.menuIcon} />
      </div>
      <NavLinks
        className={cx({ [css.openNav]: open }, { [css.closedItem]: !open })}
      />
    </div>
  );
}

export default function DatabaseTableNav(props: Props) {
  return props.isMobile ? (
    <div>
      {props.showTableNav && <Nav {...props} initiallyOpen />}
      <MobileTableNavButton
        showTableNav={props.showTableNav}
        setShowTableNav={props.setShowTableNav}
      />
    </div>
  ) : (
    <Nav {...props} />
  );
}

function isInitiallyOpen(params: Params): boolean {
  return !!params.tableName || !!params.q;
}
