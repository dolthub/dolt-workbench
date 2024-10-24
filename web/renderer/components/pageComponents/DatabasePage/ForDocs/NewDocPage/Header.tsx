import GoBack from "@components/GoBack";
import { RefParams } from "@lib/params";
import { defaultDoc } from "@lib/urls";
import css from "./index.module.css";

type Props = {
  params: RefParams;
};

export default function Header(props: Props) {
  return (
    <div>
      <GoBack
        url={defaultDoc({ ...props.params, refName: props.params.refName })}
        pageName="docs"
        className={css.goBack}
      />
      <div className={css.title}>Add a README or LICENSE</div>
    </div>
  );
}
