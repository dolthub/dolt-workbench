import { RefParams } from "@lib/params";
import DocsPage from "./DocsPage";
import NewDocPage from "./NewDocPage";

type Props = {
  params: RefParams & {
    docName?: string;
  };
  title?: string;
  new?: boolean;
};

export default function ForDocs(props: Props) {
  if (props.new) {
    return (
      <NewDocPage params={{ ...props.params, refName: props.params.refName }} />
    );
  }
  return (
    <DocsPage
      {...props}
      params={{ ...props.params, refName: props.params.refName }}
    />
  );
}
