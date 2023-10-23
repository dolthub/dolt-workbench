import SmallLoader from "@components/SmallLoader";
import {
  DocListForDocPageFragment,
  useDocsRowsForDocPageQuery,
} from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { newDoc } from "@lib/urls";
import { HiOutlineDocumentAdd } from "@react-icons/all-files/hi/HiOutlineDocumentAdd";
import DropdownItem from "./Item";

type Props = {
  params: RefParams;
};

type InnerProps = Props & {
  docs?: DocListForDocPageFragment;
};

function Inner(props: InnerProps) {
  const canCreateNewDoc = !props.docs || props.docs.list.length < 2;

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
  const res = useDocsRowsForDocPageQuery({
    variables: props.params,
  });

  if (res.loading) return <SmallLoader loaded={false} />;
  return <Inner {...props} docs={res.data?.docs} />;
}
