import SmallLoader from "@components/SmallLoader";
import { useDocsRowsForDocPageQuery } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { newDoc } from "@lib/urls";
import { HiOutlineDocumentAdd } from "@react-icons/all-files/hi/HiOutlineDocumentAdd";
import DropdownItem from "./Item";

type InnerProps = {
  params: RefParams;
  userHasWritePerms: boolean;
};

type Props = InnerProps & {
  doltDisabled?: boolean;
};

function Inner(props: InnerProps) {
  const res = useDocsRowsForDocPageQuery({
    variables: props.params,
  });

  if (res.loading) return <SmallLoader loaded={false} />;

  const canCreateNewDoc =
    !props.userHasWritePerms ||
    !res.data?.docs ||
    res.data?.docs.list.length < 2;

  return <NewDocLink params={props.params} hide={!canCreateNewDoc} />;
}

export default function DocsDropdownItem(props: Props) {
  if (props.doltDisabled) {
    return (
      <NewDocLink
        params={props.params}
        doltDisabled={props.doltDisabled}
        hide={!props.userHasWritePerms}
      />
    );
  }

  return <Inner {...props} />;
}

function NewDocLink(props: {
  params: RefParams;
  doltDisabled?: boolean;
  hide?: boolean;
}) {
  return (
    <DropdownItem
      url={newDoc(props.params)}
      icon={<HiOutlineDocumentAdd />}
      data-cy="add-dropdown-new-docs-link"
      doltDisabled={props.doltDisabled}
      hide={props.hide}
    >
      New README/LICENSE
    </DropdownItem>
  );
}
