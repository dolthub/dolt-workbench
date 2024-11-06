import DatabaseHeaderAndNav from "@components/DatabaseHeaderAndNav";
import DatabaseTableHeader from "@components/DatabaseTableHeader";
import DatabaseTableHeaderMobile from "@components/DatabaseTableHeader/DatabaseTableHeaderMobile";
import DatabaseTableNav from "@components/DatabaseTableNav";
import KeyNav from "@components/util/KeyNav";
import { useReactiveWidth } from "@dolthub/react-hooks";
import { DatabasePageParams } from "@lib/params";
import { RefUrl, database } from "@lib/urls";
import cx from "classnames";
import { ReactNode, useState } from "react";
import Wrapper from "./Wrapper";
import css from "./index.module.css";

type Props = {
  title?: string;
  children: ReactNode;
  params: DatabasePageParams;
  leftNavInitiallyOpen?: boolean;
  wide?: boolean;
  showSqlConsole?: boolean;
  empty?: boolean;
  initialTabIndex: number;
  routeRefChangeTo?: RefUrl;
  initialSmallHeader?: boolean;
  smallHeaderBreadcrumbs?: ReactNode;
  leftTableNav?: ReactNode;
};

const forElectron = process.env.NEXT_PUBLIC_FOR_ELECTRON === "true";

export default function DatabaseLayout(props: Props) {
  const [showSmallHeader, setShowSmallHeader] = useState(
    !!props.initialSmallHeader,
  );
  const { q, tableName, ...refParams } = props.params;
  const forDataTable = !!(q || tableName);
  const showHeader = forDataTable || props.showSqlConsole || props.empty;
  const useFullWidth = forDataTable || !!props.wide;
  const { isMobile } = useReactiveWidth(1024);
  const [showTableNav, setShowTableNav] = useState(false);
  return (
    <Wrapper params={props.params}>
      <DatabaseHeaderAndNav
        initialTabIndex={props.initialTabIndex}
        params={refParams}
        breadcrumbs={props.smallHeaderBreadcrumbs}
        title={props.title}
        showSmall={showSmallHeader && !forElectron}
        setShowSmall={setShowSmallHeader}
        showHeaderDetails={!forElectron}
      />
      <div
        className={cx(css.content, {
          [css.contentWithHeader]: !!showHeader,
          [css.contentWithSmallHeader]: showSmallHeader,
          [css.lessMarginTop]: forElectron,
        })}
      >
        {props.leftTableNav || (
          <DatabaseTableNav
            params={props.params}
            initiallyOpen={props.leftNavInitiallyOpen}
            showTableNav={showTableNav}
            setShowTableNav={setShowTableNav}
            isMobile={isMobile}
            routeRefChangeTo={props.routeRefChangeTo ?? database}
          />
        )}
        <div className={css.rightContent}>
          <div className={css.main}>
            {!!showHeader &&
              (isMobile ? (
                <DatabaseTableHeaderMobile {...props} />
              ) : (
                <DatabaseTableHeader {...props} />
              ))}
            <KeyNav
              className={cx(css.rightContentScroller, {
                [css.maxWidth]: !useFullWidth,
                [css.noHeader]: !showHeader,
              })}
              mobileBreakpoint={1024}
            >
              {props.children}
            </KeyNav>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
