import QueryHandler from "@components/util/QueryHandler";
import { useTagListQuery } from "@gen/graphql-types";
import { OptionalRefParams } from "@lib/params";
import { RefUrl } from "@lib/urls";
import { useEffect, useState } from "react";
import { BranchSelector } from "./BranchSelector";
import TabWrapper from "./TabWrapper";
import TagSelector from "./TagSelector";

type Props = {
  params: OptionalRefParams;
  selectedValue?: string;
  routeRefChangeTo: RefUrl;
  className?: string;
  doltDisabled?: boolean;
};

function Inner(props: Props) {
  // We need to fetch tags in this outer component to determine the active tab.
  const tagRes = useTagListQuery({
    variables: props.params,
  });
  const [showFirstTab, setShowFirstTab] = useState(true);
  const [autoFocusFirst, setAutoFocusFirst] = useState(false);
  const [autoFocusSecond, setAutoFocusSecond] = useState(false);

  useEffect(() => {
    if (!tagRes.data?.tags.list.length || !props.selectedValue) return;
    if (tagRes.data.tags.list.find(t => t.tagName === props.selectedValue)) {
      setShowFirstTab(false);
    }
  }, [tagRes.data?.tags, props.selectedValue, setShowFirstTab]);

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
      {
        label: "Tags",
        active: !showFirstTab,
        onClick: () => {
          setShowFirstTab(false);
          setAutoFocusSecond(true);
        },
      },
    ],
    selectedValue: props.selectedValue,
    routeRefChangeTo: props.routeRefChangeTo,
    useValueAsSingleValue: true,
    doltDisabled: props.doltDisabled,
  };

  return (
    <TabWrapper className={props.className} showFirstTab={showFirstTab}>
      <BranchSelector
        {...formSelectProps}
        params={props.params}
        autoFocus={autoFocusFirst}
      />
      <QueryHandler
        result={tagRes}
        render={data => (
          <TagSelector
            {...formSelectProps}
            params={props.params}
            autoFocus={autoFocusSecond}
            tags={data.tags.list}
          />
        )}
      />
    </TabWrapper>
  );
}

export default function ForBranchesAndTags(props: Props) {
  if (props.doltDisabled) {
    return <BranchSelector {...props} />;
  }
  return <Inner {...props} />;
}
