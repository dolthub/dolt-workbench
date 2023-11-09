import ReactPopup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { PopupProps } from "reactjs-popup/dist/types";

export default function Popup(props: PopupProps) {
  return (
    <ReactPopup
      {...props}
      contentStyle={{
        borderRadius: "0.5rem",
        border: "none",
        boxShadow: "0 0 4px 0 rgba(145, 164, 168, 0.5)",
        zIndex: "40",
        ...props.contentStyle,
      }}
    >
      {props.children}
    </ReactPopup>
  );
}
