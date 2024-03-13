import { useEffectOnMount } from "@dolthub/react-hooks";
import { Maybe } from "@dolthub/web-utils";
import useDefaultBranch from "@hooks/useDefaultBranch";
import { OptionalRefParams } from "@lib/params";
import { useEffect, useState } from "react";
import CustomBranchSelector from "./BranchSelector";
import CommitSelector from "./CommitSelector";
import TabWrapper from "./TabWrapper";

type Props = {
  params: OptionalRefParams;
  selectedValue: Maybe<string>;
  onChangeValue: (s: Maybe<string>) => void;
};

export default function ForBranchesAndCommits(props: Props) {
  const [showFirstTab, setShowFirstTab] = useState(true);
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false);
  const { defaultBranchName } = useDefaultBranch(props.params);

  useEffectOnMount(() => {
    if (props.params.refName) {
      props.onChangeValue(props.params.refName);
    }
  });

  useEffect(() => {
    if (!showFirstTab) {
      setShouldAutoFocus(true);
    }
  }, [showFirstTab]);

  const formSelectProps = {
    tabs: [
      {
        label: "Branches",
        active: showFirstTab,
        onClick: () => setShowFirstTab(true),
      },
      {
        label: "Commits",
        active: !showFirstTab,
        onClick: () => setShowFirstTab(false),
      },
    ],
    selectedValue: props.selectedValue,
    onChangeValue: props.onChangeValue,
    customDropdown: true,
    useValueAsSingleValue: true,
  };

  return (
    <TabWrapper
      label="Pick a branch or recent commit"
      showFirstTab={showFirstTab}
    >
      <CustomBranchSelector
        {...formSelectProps}
        params={props.params}
        autoFocus={shouldAutoFocus}
      />
      <CommitSelector
        {...formSelectProps}
        params={{
          ...props.params,
          refName: props.params.refName ?? defaultBranchName,
        }}
        autoFocus
      />
    </TabWrapper>
  );
}
