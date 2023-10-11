/* 
reactjs-popup stays in it's absolute position when scrolled, 
this is a workaround until the issue is fixed 
https://github.com/yjose/reactjs-popup/issues/208

Make sure to include the following in your react component
  useEffectOnMount(() => {
    document.addEventListener("wheel", fakeEscapePress);
    return () => document.removeEventListener("wheel", fakeEscapePress);
  });
*/

export default function fakeEscapePress() {
  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Escape",
    }),
  );
  document.dispatchEvent(
    new KeyboardEvent("keyup", {
      key: "Escape",
    }),
  );
}
