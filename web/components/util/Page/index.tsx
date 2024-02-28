import {
  applyTailwindTheme,
  workbenchTailwindColorTheme,
} from "@dolthub/react-components";
import { useEffectOnMount } from "@dolthub/react-hooks";
import { ReactNode } from "react";
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
    // Applies hosted tailwind theme
    applyTailwindTheme(workbenchTailwindColorTheme);

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
    <div className={props.className} id="page">
      <Meta
        title={props.title}
        description={props.description}
        noIndex={props.noIndex}
      />
      {props.children}
    </div>
  );
}
