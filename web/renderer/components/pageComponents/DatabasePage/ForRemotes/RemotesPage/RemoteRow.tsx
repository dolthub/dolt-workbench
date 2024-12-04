import { RemoteFragment } from "@gen/graphql-types";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { Button } from "@dolthub/react-components";
import { FaRegTrashAlt } from "@react-icons/all-files/fa/FaRegTrashAlt";
import { DatabaseParams } from "@lib/params";
import css from "./index.module.css";

type Props = {
  remote: RemoteFragment;
  onDeleteClicked: () => void;
  params: DatabaseParams;
};

export default function RemoteRow({ remote, onDeleteClicked, params }: Props) {
  return (
    <tr>
      <td>{remote.name}</td>
      <td>{remote.url}</td>
      <td>{remote.fetchSpecs?.join(",")}</td>
      <td className={css.trashColumn}>
        <HideForNoWritesWrapper params={params}>
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
