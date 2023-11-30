import excerpt from "@lib/excerpt";
import { FiKey } from "@react-icons/all-files/fi/FiKey";
import { Handle, Position } from "reactflow";
import css from "./index.module.css";
import { NodeData } from "./types";
import { getColType } from "./utils";

type Props = {
  data: NodeData;
};

export default function TableNode({ data }: Props) {
  return (
    <div>
      <table className={css.node} data-cy={`er-diagram-${data.tableName}`}>
        <thead title={data.tableName}>
          <tr>
            <th colSpan={4}>{data.tableName}</th>
          </tr>
        </thead>
        <tbody>
          {data.columns.map(col => (
            <tr key={col.name}>
              <td>
                <div className={css.colName}>
                  {excerpt(col.name, 24)}
                  {col.isPrimaryKey && <FiKey />}
                </div>
              </td>
              <td>{getColType(col.type)} </td>
            </tr>
          ))}
        </tbody>
      </table>
      <TableHandles data={data} />
    </div>
  );
}

function TableHandles({ data }: Props) {
  return (
    <>
      {Array.from(data.sourceHandles).map(h => {
        const columnInd = parseInt(h.split("-")[2], 10);
        return (
          <Handle
            key={h}
            type="source"
            position={Position.Right}
            style={{
              top: 30 * columnInd + 50,
              width: 0,
              height: 0,
              minWidth: 0,
              minHeight: 0,
            }}
            isConnectable={false}
            id={h}
          />
        );
      })}
      {Array.from(data.targetHandles).map(h => {
        const columnName = h.split("-")[2].split(",")[0];
        const columnInd = data.columns.findIndex(c => c.name === columnName);
        return (
          <Handle
            key={h}
            type="target"
            position={Position.Left}
            style={{
              top: 45 + 30 * columnInd,
              width: 0,
              height: 0,
              minWidth: 0,
              minHeight: 0,
            }}
            isConnectable={false}
            id={h}
          />
        );
      })}
    </>
  );
}
