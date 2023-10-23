import SmallLoader from "@components/SmallLoader";
import { useDocsRowsForDocPageQuery } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { newDoc } from "@lib/urls";
import { HiOutlineDocumentAdd } from "@react-icons/all-files/hi/HiOutlineDocumentAdd";
import DropdownItem from "./Item";

type InnerProps = {
  params: RefParams;
};

type Props = InnerProps & {
  doltDisabled?: boolean;
};

function Inner(props: InnerProps) {
  const res = useDocsRowsForDocPageQuery({
    variables: props.params,
  });

  if (res.loading) return <SmallLoader loaded={false} />;

  const canCreateNewDoc = !res.data?.docs || res.data?.docs.list.length < 2;

  return (
    <DropdownItem
      url={newDoc(props.params)}
      icon={<HiOutlineDocumentAdd />}
      hide={!canCreateNewDoc}
      data-cy="add-dropdown-new-docs-link"
    >
      New README/LICENSE
    </DropdownItem>
  );
}

export default function DocsDropdownItem(props: Props) {
  if (props.doltDisabled) {
    return (
      <DropdownItem
        url={newDoc(props.params)}
        icon={<HiOutlineDocumentAdd />}
        data-cy="add-dropdown-new-docs-link"
        doltDisabled={props.doltDisabled}
      >
        New README/LICENSE
      </DropdownItem>
    );
  }

  return <Inner {...props} />;
}
