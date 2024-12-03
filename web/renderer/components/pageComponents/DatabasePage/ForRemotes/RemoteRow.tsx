import { RemoteFragment } from "@gen/graphql-types";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { Button } from "@dolthub/react-components";
import { FaRegTrashAlt } from "@react-icons/all-files/fa/FaRegTrashAlt";
import css from "./index.module.css";

type Props = {
  remote: RemoteFragment;
  onDeleteClicked: (r: RemoteFragment) => void;
};

export default function RemoteRow({ remote, onDeleteClicked }: Props) {
  return (
    <tr>
      <td>{remote.name}</td>
      <td>{remote.url}</td>
      <td>
        {remote.fetchSpecs?.map((fs, i) => (
          <span key={fs}>
            {fs}
            {i < (remote.fetchSpecs?.length ?? 0) - 1 ? ", " : ""}
          </span>
        ))}
      </td>
      <td className={css.trashColumn}>
        <HideForNoWritesWrapper params={remote}>
          <Button.Link
            onClick={onDeleteClicked}
            red
            className={css.icon}
            aria-label="delete"
          >
            <FaRegTrashAlt />
          </Button.Link>
        </HideForNoWritesWrapper>
      </td>
    </tr>
  );
}
