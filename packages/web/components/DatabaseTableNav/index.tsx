import CustomFormSelect from "@components/CustomFormSelect";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { OptionalRefParams } from "@lib/params";
import { RefUrl } from "@lib/urls";
import { GiHamburgerMenu } from "@react-icons/all-files/gi/GiHamburgerMenu";
import cx from "classnames";
import { useState } from "react";
import MobileTableNavButton from "./MobileTableNavButton";
import NavLinks from "./NavLinks";
import css from "./index.module.css";

type Params = OptionalRefParams & {
  tableName?: string;
  q?: string;
};

type NavProps = {
  params: Params;
  initiallyOpen?: boolean;
  isMobile?: boolean;
  routeRefChangeTo: RefUrl;
};

type Props = NavProps & {
  showTableNav: boolean;
  setShowTableNav: (s: boolean) => void;
};

function Nav({
  params,
  routeRefChangeTo,
  initiallyOpen = false,
  isMobile = false,
}: NavProps) {
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
        <NotDoltWrapper>
          <CustomFormSelect.ForBranchesAndTags
            routeRefChangeTo={routeRefChangeTo}
            params={params}
            selectedValue={params.refName}
            className={cx(css.openBranchSelector, { [css.closedItem]: !open })}
          />
        </NotDoltWrapper>
        <GiHamburgerMenu
          onClick={toggleMenu}
          className={css.menuIcon}
          data-cy="left-nav-toggle-icon"
        />
      </div>
      <NavLinks
        className={cx({ [css.openNav]: open }, { [css.closedItem]: !open })}
        params={params}
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
