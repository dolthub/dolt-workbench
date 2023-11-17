import FormSelect from "@components/FormSelect";
import { Option } from "@components/FormSelect/types";
import useIsDolt from "@hooks/useIsDolt";
import {
  getDatabasePageName,
  getDatabasePageRedirectInfo,
} from "@lib/mobileUtils";
import { OptionalRefParams } from "@lib/params";
import { colors } from "@lib/tailwind";
import { useRouter } from "next/router";
import { GroupBase, StylesConfig } from "react-select";

type Props = {
  params: OptionalRefParams;
  className?: string;
  title?: string;
};

const getTabOptions = (isDolt: boolean, hideDoltFeature: boolean): Option[] => {
  if (hideDoltFeature) return [{ value: "ref", label: "Database" }];
  return [
    { value: "ref", label: "Database" },
    { value: "about", label: "About", isDisabled: !isDolt },
    { value: "commitLog", label: "Commit Log", isDisabled: !isDolt },
    { value: "releases", label: "Releases", isDisabled: !isDolt },
    // { value: "pulls", label: "Pull Requests", isDisabled: !isDolt },
  ];
};

const mobileSelectorStyle: StylesConfig<Option, boolean, GroupBase<Option>> = {
  placeholder: styles => {
    return {
      ...styles,
      color: "#FFFFFFE5",
    };
  },
  control: styles => {
    return {
      ...styles,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.1)",
      marginTop: "1rem",
    };
  },
  menu: styles => {
    return {
      ...styles,
      color: colors["ld-darkergrey"],
    };
  },
  singleValue: styles => {
    return {
      ...styles,
      color: "#FFFFFFE5",
    };
  },
  dropdownIndicator: styles => {
    return {
      ...styles,
    };
  },
};

export default function MobileHeaderSelector(props: Props) {
  const res = useIsDolt();
  const router = useRouter();

  const handleChangeTab = (pageName: string) => {
    const { href, as } = getDatabasePageRedirectInfo(pageName, props.params);
    router.push(href, as).catch(console.error);
  };
  const pageName = getDatabasePageName(props.title);

  return (
    <FormSelect
      onChangeValue={handleChangeTab}
      options={getTabOptions(res.isDolt, res.hideDoltFeature)}
      val={pageName}
      hideSelectedOptions
      styles={mobileSelectorStyle}
      className={props.className}
      isMobile
    />
  );
}
