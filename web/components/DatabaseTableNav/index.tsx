import BranchAndTagSelector from "@components/FormSelectForRefs/BranchAndTagSelector";
import NotDoltSelectWrapper from "@components/FormSelectForRefs/NotDoltSelectWrapper";
import SchemasSelector from "@components/SchemasSelector";
import Link from "@components/links/Link";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { Tooltip } from "@dolthub/react-components";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import { OptionalRefParams } from "@lib/params";
import { RefUrl, newBranch } from "@lib/urls";
import { GiHamburgerMenu } from "@react-icons/all-files/gi/GiHamburgerMenu";
import { IoAddOutline } from "@react-icons/all-files/io5/IoAddOutline";
import cx from "classnames";
import { useState } from "react";
import MobileTableNavButton from "./MobileTableNavButton";
import NavLinks from "./NavLinks";
import css from "./index.module.css";

type Params = OptionalRefParams & {
  tableName?: string;
  schemaName?: string;
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
          <GiHamburgerMenu
            onClick={toggleMenu}
            className={css.menuIcon}
            data-cy="left-nav-toggle-icon"
          />
        </div>
        {isPostgres && params.refName && (
          <div
            className={cx(css.openBranchSelector, { [css.closedItem]: !open })}
          >
            <SchemasSelector
              params={{ ...params, refName: params.refName }}
              routeRefChangeTo={routeRefChangeTo}
            />
          </div>
        )}
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

function isInitiallyOpen(params: Params): boolean {
  return !!params.tableName || !!params.q;
}

function NewBranchLink(props: {
  params: Params;
  open: boolean;
  doltDisabled?: boolean;
}) {
  return (
    <div
      className={cx(css.createBranch, {
        [css.createBranchDisabled]: !!props.doltDisabled,
      })}
    >
      <Link
        {...newBranch(props.params)}
        data-tooltip-id="create-branch"
        data-tooltip-content={
          props.doltDisabled ? "Use Dolt to create branch" : "Create new branch"
        }
        data-tooltip-place="bottom"
      >
        <IoAddOutline
          className={cx(css.createBranchIcon, {
            [css.closedItem]: !props.open,
          })}
        />
      </Link>
      <Tooltip id="create-branch" />
    </div>
  );
}
