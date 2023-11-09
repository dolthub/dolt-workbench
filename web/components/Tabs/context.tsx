import useContextWithError from "@hooks/useContextWithError";
import { createCustomContext } from "@lib/createCustomContext";
import React, { ReactNode, useState } from "react";

type TabsContextType = {
  activeTabIndex: number;
  setActiveTabIndex: React.Dispatch<React.SetStateAction<number>>;
};

export const TabsContext = createCustomContext<TabsContextType>("TabsContext");

type Props = {
  children: ReactNode;
  initialActiveIndex?: number;
};

export function TabsProvider(props: Props) {
  const [activeTabIndex, setActiveTabIndex] = useState(
    props.initialActiveIndex ?? 0,
  );

  return (
    <TabsContext.Provider value={{ activeTabIndex, setActiveTabIndex }}>
      {props.children}
    </TabsContext.Provider>
  );
}

export function useTabsContext(): TabsContextType {
  return useContextWithError(TabsContext);
}
