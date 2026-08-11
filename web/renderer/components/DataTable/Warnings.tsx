import { IoWarningOutline } from "react-icons/io5";
import css from "./index.module.css";

type Props = {
  warnings: string[];
};

export default function Warnings({ warnings }: Props) {
  const maxNumWarnings = 5;
  const warningsToShow = warnings.slice(0, maxNumWarnings);

  return (
    <div>
      {warningsToShow.map(warning => (
        <div key={warning} className={css.warning}>
          <IoWarningOutline />
          <p>{warning}</p>
        </div>
      ))}
    </div>
  );
}
