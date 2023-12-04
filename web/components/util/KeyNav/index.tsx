import { useFocus, useReactiveWidth } from "@dolthub/react-hooks";
import { createElement, ReactHTML, ReactNode } from "react";

type Props = {
  children: ReactNode;
  id?: string;
  className?: string;
  tag?: keyof ReactHTML;
  onScroll?: () => void;
  mobileBreakpoint?: number;
};

// This component enables default keyboard navigation for its children.
// Should be disabled for mobile devices
const KeyNav = ({
  id = "main-content",
  tag = "main",
  mobileBreakpoint = 768,
  className,
  children,
  onScroll,
}: Props) => {
  const { isMobile } = useReactiveWidth(null, mobileBreakpoint);

  if (!isMobile) {
    return (
      <DesktopNav className={className} onScroll={onScroll} id={id} tag={tag}>
        {children}
      </DesktopNav>
    );
  }
  return createElement(tag, { className, onScroll, id }, children);
};

export default KeyNav;

type DesktopProps = {
  children: ReactNode;
  id: string;
  className?: string;
  tag: keyof ReactHTML;
  onScroll?: () => void;
};

function DesktopNav({ children, id, className, tag, onScroll }: DesktopProps) {
  useFocus(id);
  return createElement(
    tag,
    { id, onScroll, className, tabIndex: -1 },
    children,
  );
}
