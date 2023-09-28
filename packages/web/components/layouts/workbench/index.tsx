"use client";

import DatabaseTableHeader from "@dsw/components/DatabaseTableHeader";
import DatabaseTableNav from "@dsw/components/DatabaseTableNav";
import Navbar from "@dsw/components/Navbar";
import KeyNav from "@dsw/components/util/KeyNav";
import { useReactiveWidth } from "@dsw/hooks/useReactiveSize";
import cx from "classnames";
import { ReactNode, useState } from "react";
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
};

export default function WorkbenchLayout(props: Props) {
  const [showTableNav, setShowTableNav] = useState(false);
  const { isMobile } = useReactiveWidth(null, 1024);
  const { q, tableName } = props.params;
  const forDataTable = !!(q || tableName);
  const showHeader = forDataTable;
  const useFullWidth = forDataTable || !!props.wide;

  return (
    <div className={css.appLayout}>
      <Navbar />
      <div className={css.layoutWrapperContainer}>
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
              {!!showHeader && <DatabaseTableHeader {...props} />}
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
      </div>
    </div>
  );
}
