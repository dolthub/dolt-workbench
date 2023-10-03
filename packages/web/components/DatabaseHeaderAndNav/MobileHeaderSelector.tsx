import FormSelect from "@components/FormSelect";
import { Option } from "@components/FormSelect/types";
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

const options: Option[] = [
  { value: "ref", label: "Database" },
  // { value: "about", label: "About" },
  // { value: "commitLog", label: "Commit Log" },
  // { value: "releases", label: "Releases" },
  // { value: "pulls", label: "Pull Requests" },
];

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
      backgroundColor: "#4B75C1",
      borderColor: "#4B75C1",
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
  const router = useRouter();
  const handleChangeTab = (pageName: string) => {
    const { href, as } = getDatabasePageRedirectInfo(pageName, props.params);
    router.push(href, as).catch(console.error);
  };
  const pageName = getDatabasePageName(props.title);

  return (
    <FormSelect
      onChangeValue={handleChangeTab}
      options={options}
      val={pageName}
      hideSelectedOptions
      styles={mobileSelectorStyle}
      className={props.className}
      isMobile
    />
  );
}
