import { ErrorMsgProvider } from "@dolthub/react-components";
import { useEffectOnMount } from "@dolthub/react-hooks";
import { improveErrorMsg } from "@lib/errors/helpers";
import { ReactNode } from "react";
import renderCustomErrorMsg from "./CustomErrorMsg";
import Meta from "./Meta";

type Props = {
  children?: ReactNode;
  className?: string;
  title: string;
  description?: string;
  noIndex?: boolean;
};

// Should be used as the outermost component for every page. Defines the page meta,
// including the title and description
export default function Page(props: Props) {
  useEffectOnMount(() => {
    // Check that Page is the outermost component
    const pageNode = document.getElementById("page");
    if (!pageNode) {
      return;
    }
    const parent = pageNode.parentElement;
    if (parent?.id !== "__next") {
      console.error("Page component must be outermost component for each page");
    }
  });

  return (
    <ErrorMsgProvider
      improveErrorMsgFn={improveErrorMsg}
      renderDifferentComp={renderCustomErrorMsg}
    >
      <div className={props.className} id="page">
        <Meta
          title={props.title}
          description={props.description}
          noIndex={props.noIndex}
        />
        {props.children}
      </div>
    </ErrorMsgProvider>
  );
}
