import { RemoteFragment } from "@gen/graphql-types";

type Props = {
  remote: RemoteFragment;
};

export default function Row({ remote }: Props) {
  return (
    <tr>
      <td>{remote.name}</td>
      <td>{remote.url}</td>
      <td>
        {remote.fetchSpecs.map((fs, i) => (
          <span key={fs}>
            {fs}
            {i < remote.fetchSpecs.length - 1 ? ", " : ""}
          </span>
        ))}
      </td>
      <td>{remote.params}</td>
    </tr>
  );
}
