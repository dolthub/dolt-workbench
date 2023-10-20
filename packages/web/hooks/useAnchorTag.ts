import { useEffect } from "react";

// This hook should be used on pages with anchor tags.
export default function useAnchorTag() {
  // The following is a kludge to make hash fragments in URLs work on this page
  // when it is client-side rendered. There are lots of links like /#doltlab and
  // /team#tim floating around, and without this they don't work when the
  // navigation is full page load and client-side rendered.
  useEffect(() => {
    const { hash } = window.location;
    if (!hash.length) return;
    window.location.hash = "";
    window.location.hash = hash;
  });
}
