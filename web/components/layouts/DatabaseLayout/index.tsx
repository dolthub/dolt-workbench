import DatabaseHeaderAndNav from "@components/DatabaseHeaderAndNav";
import DatabaseTableHeader from "@components/DatabaseTableHeader";
import DatabaseTableHeaderMobile from "@components/DatabaseTableHeader/DatabaseTableHeaderMobile";
import DatabaseTableNav from "@components/DatabaseTableNav";
import KeyNav from "@components/util/KeyNav";
import { useReactiveWidth } from "@dolthub/react-hooks";
import { OptionalRefParams } from "@lib/params";
import { RefUrl, database } from "@lib/urls";
import cx from "classnames";
import { ReactNode, useState } from "react";
import Wrapper from "./Wrapper";
import css from "./index.module.css";

type DatabaseLayoutParams = OptionalRefParams & {
  schemaName?: string;
  tableName?: string;
  q?: string;
};

type Props = {
  title?: string;
  children: ReactNode;
  params: DatabaseLayoutParams;
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
    <Wrapper>
      <DatabaseHeaderAndNav
        initialTabIndex={props.initialTabIndex}
        params={refParams}
        breadcrumbs={props.smallHeaderBreadcrumbs}
        title={props.title}
        showSmall={showSmallHeader}
        setShowSmall={setShowSmallHeader}
      />
      <div
        className={cx(css.content, {
          [css.contentWithHeader]: !!showHeader,
          [css.contentWithSmallHeader]: showSmallHeader,
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
