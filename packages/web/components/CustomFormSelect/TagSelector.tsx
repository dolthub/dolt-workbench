import { TagForListFragment } from "@gen/graphql-types";
import { DatabaseParams } from "@lib/params";
import { RefUrl, database } from "@lib/urls";
import { useRouter } from "next/router";
import Selector from "./component";
import { BaseFormSelectorProps, Tab } from "./types";

type Props = BaseFormSelectorProps & {
  params: DatabaseParams;
  tabs: Tab[];
  routeRefChangeTo?: RefUrl;
  tags: TagForListFragment[];
};

export default function TagSelector(props: Props) {
  const router = useRouter();

  const handleChangeRef = async (refName: string) => {
    const { href, as } = props.routeRefChangeTo
      ? props.routeRefChangeTo({
          ...props.params,
          refName,
        })
      : database(props.params);

    router.push(href, as).catch(console.error);
  };

  return (
    <div data-cy="tag-selector" aria-label="tag-selector">
      <Selector
        {...props}
        dataCySuffix="-tag"
        onChangeValue={handleChangeRef}
        val={props.selectedValue ?? ""}
        noneFoundMsg="No tags found"
        label="Tag"
        options={props.tags.map(t => {
          return {
            value: t.tagName,
            label: t.tagName,
          };
        })}
        // footerLink={{
        //   urlString: "View all tags",
        //   urlParams: releases(props.params),
        // }}
      />
    </div>
  );
}
