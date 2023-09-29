import DatabaseTableHeader from "@components/DatabaseTableHeader";
import DatabaseTableHeaderMobile from "@components/DatabaseTableHeader/DatabaseTableHeaderMobile";
import DatabaseTableNav from "@components/DatabaseTableNav";
import KeyNav from "@components/util/KeyNav";
import { useReactiveWidth } from "@hooks/useReactiveSize";
import cx from "classnames";
import { ReactNode, useState } from "react";
import Wrapper from "./Wrapper";
import css from "./index.module.css";

type DatabaseLayoutParams = {
  tableName?: string;
  q?: string;
};

type Props = {
  title?: string;
  children: ReactNode;
  params: DatabaseLayoutParams;
  leftNavInitiallyOpen?: boolean;
  wide?: boolean;
  initialTabIndex?: number;
};

export default function DatabaseLayout(props: Props) {
  const [showTableNav, setShowTableNav] = useState(false);
  const { isMobile } = useReactiveWidth(null, 1024);
  const { q, tableName } = props.params;
  const forDataTable = !!(q || tableName);
  const showHeader = forDataTable;
  const useFullWidth = forDataTable || !!props.wide;

  return (
    <Wrapper>
      <div className={cx(css.content, css.contentWithHeader)}>
        <DatabaseTableNav
          params={props.params}
          initiallyOpen={props.leftNavInitiallyOpen}
          showTableNav={showTableNav}
          setShowTableNav={setShowTableNav}
          isMobile={isMobile}
        />
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
