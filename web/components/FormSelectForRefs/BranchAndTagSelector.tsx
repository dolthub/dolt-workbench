import { FormSelect } from "@dolthub/react-components";
import { Maybe } from "@dolthub/web-utils";
import { useTableNamesForBranchLazyQuery } from "@gen/graphql-types";
import { DatabasePageParams } from "@lib/params";
import { RefUrl, branches, ref, releases } from "@lib/urls";
import cx from "classnames";
import { useRouter } from "next/router";
import getGroupOption from "./getGroupOption";
import css from "./index.module.css";
import useGetBranchOptionsForSelect from "./useGetBranchOptionsForSelect";
import useGetTagOptionsForSelect from "./useGetTagOptionsForSelect";

type Props = {
  params: DatabasePageParams;
  selectedValue?: string;
  routeRefChangeTo: RefUrl;
  className?: string;
  isPostgres?: boolean;
};

export default function BranchAndTagSelector(props: Props) {
  const router = useRouter();

  const [getTableNames] = useTableNamesForBranchLazyQuery();

  const {
    tagOptions,
    error: tagErr,
    loading: tagLoading,
  } = useGetTagOptionsForSelect(props.params);
  const {
    branchOptions,
    error: branchErr,
    loading: branchLoading,
  } = useGetBranchOptionsForSelect(props.params);

  const handleChangeRef = async (refName: Maybe<string>) => {
    if (!refName) return;
    const variables = {
      ...props.params,
      refName,
    };

    // If on a table page, check if the table exists on the new branch. If not,
    // route to ref.
    if (props.params.tableName) {
      const tableRes = await getTableNames({ variables });
      const tableExists = tableRes.data?.tableNames.list.some(
        t => t === props.params.tableName,
      );
      if (!tableExists) {
        const { href, as } = ref({ ...props.params, refName });
        router.push(href, as).catch(console.error);
        return;
      }
    }

    // TODO(doltgres): Don't include current schema
    const { href, as } = props.routeRefChangeTo({
      ...props.params,
      refName,
    });

    router.push(href, as).catch(console.error);
  };

  const options = [
    getGroupOption(
      branchOptions,
      "Branches",
      branches({ ...props.params, refName: props.selectedValue }),
      branchErr,
    ),
    getGroupOption(tagOptions, "Tags", releases(props.params), tagErr),
  ];

  return (
    <FormSelect.Grouped
      isLoading={branchLoading || tagLoading}
      data-cy="branch-and-tag-selector"
      value={[...branchOptions, ...tagOptions].find(
        t => t.value === props.selectedValue,
      )}
      onChange={async e => handleChangeRef(e?.value)}
      options={options}
      placeholder="select a branch or tag..."
      outerClassName={cx(
        { [css.outerForPostgres]: !!props.isPostgres },
        props.className,
      )}
      labelClassName={css.branchLabel}
      className={cx(css.branchAndTagSelect, {
        [css.selectForPostgres]: !!props.isPostgres,
      })}
      label={props.isPostgres ? "Branch" : undefined}
      horizontal
      selectedOptionFirst
      light
    />
  );
}
