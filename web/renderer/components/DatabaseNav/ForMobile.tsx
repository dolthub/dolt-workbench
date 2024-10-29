import { FormSelect, FormSelectTypes } from "@dolthub/react-components";
import { Maybe } from "@dolthub/web-utils";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import { OptionalRefParams } from "@lib/params";
import { useRouter } from "next/router";
import Wrapper from "./Wrapper";
import { tabs } from "./tabs";
import { getUrlForRefName } from "./utils";

type Props = {
  params: OptionalRefParams;
  initialTabIndex: number;
};

export default function MobileDatabaseNav(props: Props) {
  return (
    <Wrapper
      params={props.params}
      renderChild={params => <Inner {...props} params={params} />}
    />
  );
}

function Inner(props: Props) {
  const res = useDatabaseDetails();
  const router = useRouter();

  const handleChangeTab = (pageName: Maybe<string>) => {
    if (!pageName) return;
    const { href, as } = getUrlForRefName(props.params, pageName);
    router.push(href, as).catch(console.error);
  };

  const options = getTabOptions(res.isDolt, res.hideDoltFeature);

  return (
    <FormSelect
      onChangeValue={handleChangeTab}
      options={options}
      val={tabs[props.initialTabIndex]}
      hideSelectedOptions
      forMobile
    />
  );
}

function getTabOptions(
  isDolt: boolean,
  hideDoltFeature: boolean,
): Array<FormSelectTypes.Option<string>> {
  if (hideDoltFeature) return [{ value: "Database", label: "Database" }];
  return tabs.map(t => {
    return { value: t, label: t, isDisabled: t !== "Database" && !isDolt };
  });
}
