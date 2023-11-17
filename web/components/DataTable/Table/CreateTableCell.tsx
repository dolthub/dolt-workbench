import cx from "classnames";
import dynamic from "next/dynamic";
import css from "./index.module.css";

const AceEditor = dynamic(async () => import("@components/AceEditor"), {
  ssr: false,
});

type Props = {
  value: string;
  ["data-cy"]?: string;
};

export default function CreateTableCell(props: Props) {
  const font = "13px Roboto Mono,Menlo,Monaco,Courier New,monospace,serif";
  const { height, width } = getHeightAndWidth(props.value, font);

  return (
    <td
      data-cy={props["data-cy"]}
      className={cx(css.cell, css.createTable)}
      style={{
        minWidth: `${width}px`,
        height: `${height * 20}px`,
      }}
    >
      <AceEditor
        className="create-table-ace"
        value={props.value}
        name="AceViewer"
        fontSize={13}
        readOnly
        wrapEnabled={false}
        showGutter={false}
        maxLines={Infinity}
        style={{ lineHeight: 1.5 }}
        focus
        // Should maybe fix https://github.com/dolthub/dolthub-issues/issues/86
        onLoad={editorInstance => {
          editorInstance.resize();
        }}
        light
      />
    </td>
  );
}

function getHeightAndWidth(text: string, font: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context) {
    context.font = font;
  }
  const lines = text.split("\n");
  let width = 130;
  lines.forEach(line => {
    const lineWidth = Math.floor(
      context ? context.measureText(line).width : 130,
    );
    width = lineWidth > width ? lineWidth : width;
  });
  width += 100;

  return { height: lines.length, width };
}
