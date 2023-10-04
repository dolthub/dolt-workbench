import { OptionalRefParams } from "@lib/params";
import { RefUrl } from "@lib/urls";
import { useState } from "react";
import { BranchSelector } from "./BranchSelector";
import TabWrapper from "./TabWrapper";

type Props = {
  params: OptionalRefParams;
  selectedValue?: string;
  routeRefChangeTo: RefUrl;
  className?: string;
};

export default function ForBranchesAndTags(props: Props) {
  // We need to fetch tags in this outer component to determine the active tab.
  // const tagRes = useTagListQuery({
  //   variables: props.params,
  // });
  const [showFirstTab, setShowFirstTab] = useState(true);
  const [autoFocusFirst, setAutoFocusFirst] = useState(false);
  // const [autoFocusSecond, setAutoFocusSecond] = useState(false);

  // useEffect(() => {
  //   if (!tagRes.data?.tags.list.length || !props.selectedValue) return;
  //   if (tagRes.data.tags.list.find(t => t.tagName === props.selectedValue)) {
  //     setShowFirstTab(false);
  //   }
  // }, [tagRes.data?.tags, props.selectedValue, setShowFirstTab]);

  const formSelectProps = {
    tabs: [
      {
        label: "Branches",
        active: showFirstTab,
        onClick: () => {
          setShowFirstTab(true);
          setAutoFocusFirst(true);
        },
      },
      // {
      //   label: "Tags",
      //   active: !showFirstTab,
      //   onClick: () => {
      //     setShowFirstTab(false);
      //     setAutoFocusSecond(true);
      //   },
      // },
    ],
    selectedValue: props.selectedValue,
    routeRefChangeTo: props.routeRefChangeTo,
    useValueAsSingleValue: true,
  };

  return (
    <TabWrapper className={props.className} showFirstTab={showFirstTab}>
      <BranchSelector
        {...formSelectProps}
        params={props.params}
        autoFocus={autoFocusFirst}
      />
      <div />
      {/* <QueryHandler
        result={tagRes}
        render={data => (
          <ForTags
            {...formSelectProps}
            params={props.params}
            autoFocus={autoFocusSecond}
            tags={data.tags.list}
          />
        )}
      /> */}
    </TabWrapper>
  );
}
