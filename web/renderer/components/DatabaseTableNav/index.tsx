import BranchAndTagSelector from "@components/FormSelectForRefs/BranchAndTagSelector";
import NotDoltSelectWrapper from "@components/FormSelectForRefs/NotDoltSelectWrapper";
import SchemasSelector from "@components/SchemasSelector";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import { DatabasePageParams } from "@lib/params";
import { RefUrl } from "@lib/urls";
import { GiHamburgerMenu } from "@react-icons/all-files/gi/GiHamburgerMenu";
import cx from "classnames";
import { useState } from "react";
import MobileTableNavButton from "./MobileTableNavButton";
import NavLinks from "./NavLinks";
import NewBranchLink from "./NewBranchLink";
import css from "./index.module.css";

type NavProps = {
  params: DatabasePageParams;
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
  const { isPostgres } = useDatabaseDetails();
  const [open, setOpen] = useState(initiallyOpen || isInitiallyOpen(params));
  const toggleMenu = () => {
    setOpen(!open);
  };

  return (
    <div
      className={cx(css.container, {
        [css.openContainer]: open,
        [css.closedContainer]: !open,
        [css.showForMobile]: isMobile,
      })}
    >
      <div className={css.top}>
        <div className={css.menuIcon}>
          <GiHamburgerMenu
            onClick={toggleMenu}
            data-cy="left-nav-toggle-icon"
          />
        </div>
        <div className={css.topLine}>
          <div
            className={cx(css.openBranchSelector, { [css.closedItem]: !open })}
          >
            <NotDoltSelectWrapper val={params.refName} showLabel={isPostgres}>
              <BranchAndTagSelector
                routeRefChangeTo={routeRefChangeTo}
                params={params}
                selectedValue={params.refName}
                isPostgres={isPostgres}
              />
            </NotDoltSelectWrapper>
          </div>
          <HideForNoWritesWrapper params={params}>
            <NotDoltWrapper>
              <NewBranchLink params={params} open={open} />
            </NotDoltWrapper>
          </HideForNoWritesWrapper>
        </div>
        <div className={css.topLine}>
          {isPostgres && params.refName && (
            <div
              className={cx(css.openBranchSelector, {
                [css.closedItem]: !open,
              })}
            >
              <SchemasSelector
                params={{ ...params, refName: "" }}
                routeRefChangeTo={routeRefChangeTo}
                className={css.schemaSelector}
                selectorClassName={css.selector}
              />
            </div>
          )}
        </div>
      </div>
      <NavLinks
        className={cx(css.openNav, { [css.closedItem]: !open })}
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

function isInitiallyOpen(params: DatabasePageParams): boolean {
  return !!params.tableName || !!params.q;
}
