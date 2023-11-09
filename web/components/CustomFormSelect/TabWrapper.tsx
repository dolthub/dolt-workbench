import { ReactNode } from "react";
import css from "./index.module.css";

type Props = {
  label?: string;
  showFirstTab: boolean;
  children: [ReactNode, ReactNode];
  className?: string;
};

export default function TabWrapper(props: Props) {
  return (
    <div className={props.className}>
      {props.label && <div className={css.input}>{props.label}</div>}
      {props.showFirstTab ? props.children[0] : props.children[1]}
    </div>
  );
}
