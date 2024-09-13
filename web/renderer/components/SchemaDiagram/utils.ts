import {
  ForeignKeyColumn,
  TableForSchemaListFragment,
} from "@gen/graphql-types";
import { Node, NodeInternals } from "reactflow";
import {
  CalculatePositionReturnType,
  Edge,
  GetPaintedWidthAndHeightReturnType,
  GetRelationshipMarkerReturnType,
  Graph,
  NodeData,
  TableNode,
  VisitedMask,
} from "./types";

const edgeType = "step";

export function getInitialEdges(tables: TableForSchemaListFragment[]): Edge[] {
  const tablesWithForeignKeys = tables.filter(t => t.foreignKeys.length > 0);
  const edges: Edge[] = [];

  for (let i = 0; i < tablesWithForeignKeys.length; i++) {
    for (let j = 0; j < tablesWithForeignKeys[i].foreignKeys.length; j++) {
      const table = tablesWithForeignKeys[i];
      const { tableName } = table;
      const fk = table.foreignKeys[j];
      const { referencedTableName } = fk;
      // indexCount is used for calculating the x and y positions of each table
      const indexCount = fk.foreignKeyColumn.reduce(
        (partialSum, a) => partialSum + a.referrerColumnIndex,
        0,
      );
      const fkCols = table.columns
        .map((c, idx) => {
          return { ...c, index: idx };
        })
        .filter(c => c.name === fk.columnName);
      const columnIndexes = fkCols.map(f => f.index).join("-");
      const columnNames = fk.foreignKeyColumn
        .map(f => f.referencedColumnName)
        .join(", ");

      const { markerStart, markerEnd } = getRelationshipMarker(
        tables,
        fk.foreignKeyColumn,
        table,
        referencedTableName,
      );

      const edge = {
        id: `${tableName}-${referencedTableName}-${columnIndexes}-${columnNames}`,
        source: tableName,
        sourceHandle: `source-${tableName}-${columnIndexes}`,
        targetHandle: `target-${referencedTableName}-${columnNames}`,
        indexCount,
        target: referencedTableName,
        targetColumnName: columnNames,
        sourceColumnIndexes: columnIndexes,
        type: edgeType,
        label: columnNames,
        labelStyle: {
          fontSize: "14px",
        },
        markerEnd,
        markerStart,
      };
      edges.push(edge);
    }
  }
  return edges;
}

type GetInitialNodesReturnType = {
  graph: Graph;
  nodes: TableNode[];
};

export function getInitialNodes(
  tables: TableForSchemaListFragment[],
  edges: Edge[],
): GetInitialNodesReturnType {
  const graph: Graph = {};
  const nodes = tables.map(t => {
    graph[t.tableName] = {
      sourceCount: 0,
      targetCount: 0,
      target: new Set(),
      targetIndexCount: {},
    };
    const targetHandles = new Set(
      edges.filter(e => e.target === t.tableName).map(e => e.targetHandle),
    );
    const sourceHandles = new Set(
      edges.filter(e => e.source === t.tableName).map(e => e.sourceHandle),
    );
    const node = {
      id: t.tableName,
      type: "tableNode",
      data: {
        tableName: t.tableName,
        columns: t.columns,
        targetHandles,
        sourceHandles,
      },
      position: { x: 0, y: 0 },
    };
    return node;
  });

  edges.forEach(e => {
    graph[e.source].sourceCount += 1;
    graph[e.target].targetCount += 1;
    graph[e.source].target.add(e.target);
    if (e.target in graph[e.source].targetIndexCount) {
      graph[e.source].targetIndexCount[e.target] += e.indexCount;
    } else {
      graph[e.source].targetIndexCount[e.target] = e.indexCount;
    }
  });

  return { graph, nodes };
}

export function getLayout(
  graph: Graph,
  nodes: NodeInternals,
): Array<Node<NodeData>> {
  let count = 0;
  let graphCopy = graph;
  let nodesCopy = Array.from(nodes.values());
  let visited: VisitedMask = {};
  while (Object.keys(graphCopy).length) {
    const res = calculatePosition(graphCopy, count, nodesCopy, visited);
    graphCopy = res.graph;
    nodesCopy = res.nodes;
    count = res.count;
    visited = res.visited;
  }
  return nodesCopy;
}

function findStartNodes(graph: Graph, visited: VisitedMask): string[] {
  let maxSourceMinusTargetCount = -Infinity;
  Object.keys(graph).forEach(k => {
    if (
      graph[k].sourceCount - graph[k].targetCount > maxSourceMinusTargetCount &&
      visited[k] !== 1
    ) {
      maxSourceMinusTargetCount = graph[k].sourceCount - graph[k].targetCount;
    }
  });
  const stack = Object.entries(graph)
    .filter(
      ([, value]) =>
        value.sourceCount - value.targetCount === maxSourceMinusTargetCount,
    )
    .map(f => f[0]);
  return stack;
}

// use breadth first search to find groups of connected tables, and reassign the position of each node
function calculatePosition(
  graph: Graph,
  startPosition: number,
  nodes: Array<Node<NodeData>>,
  visited: VisitedMask,
): CalculatePositionReturnType {
  const graphCopy = graph;
  let endPos = startPosition;
  const nodesCopy = [...nodes];

  const visitedCopy = visited;
  let stack = findStartNodes(graphCopy, visitedCopy);
  if (stack.length && graphCopy[stack[0]].sourceCount === 0) {
    stack.forEach(s => {
      if (!visited[s]) {
        nodesCopy.forEach(n => {
          if (n.id === s) {
            // eslint-disable-next-line no-param-reassign
            n.position = { x: endPos, y: 0 };
            endPos += (n.width ?? 300) + 200;
          }
        });

        visitedCopy[s] = 1;
        delete graphCopy[s];
      }
    });

    return {
      graph: graphCopy,
      count: endPos,
      nodes: nodesCopy,
      visited: visitedCopy,
    };
  }

  while (stack.length) {
    let newStack: string[] = [];
    let startY = 0;
    let largestW = 0;
    // eslint-disable-next-line @typescript-eslint/no-loop-func
    stack.forEach((s, i) => {
      if (!visited[s]) {
        nodesCopy.forEach(n => {
          if (n.id === s) {
            // eslint-disable-next-line no-param-reassign
            n.position = { x: endPos + i * 100, y: startY };
            const w = endPos + i * 100 + (n.width || 300);
            largestW = largestW < w ? w : largestW;
            startY += Math.ceil(n.data.columns.length / 5) * 200;
          }
        });
        visitedCopy[s] = 1;
        const sortedTarget = Array.from(graphCopy[s].target).sort(
          (a, b) =>
            graphCopy[s].targetIndexCount[a] - graphCopy[s].targetIndexCount[b],
        );
        newStack = [...newStack, ...sortedTarget];
        delete graphCopy[s];
      }
    });

    endPos = largestW + 300;
    stack = newStack;
  }
  return {
    graph: graphCopy,
    count: endPos,
    nodes: nodesCopy,
    visited: visitedCopy,
  };
}

function getRelationshipMarker(
  tables: TableForSchemaListFragment[],
  foreignKeyColumn: ForeignKeyColumn[],
  referrerTable: TableForSchemaListFragment,
  referencedTableName: string,
): GetRelationshipMarkerReturnType {
  const referencedTable = tables.filter(
    t => t.tableName === referencedTableName,
  )[0];

  const referrerColumnNames = referrerTable.columns
    .filter((c, i) =>
      foreignKeyColumn.map(f => f.referrerColumnIndex).includes(i),
    )
    .map(c => c.name);
  const referencedColumnNames = foreignKeyColumn.map(
    f => f.referencedColumnName,
  );
  const referrerPrimaryKeys = getPrimaryKeyList(referrerTable);
  const referencedPrimaryKeys = getPrimaryKeyList(referencedTable);
  const referrerTableUniqueKeys = getUniqueKeyList(referrerTable);
  const referencedTableUniqueKeys = getUniqueKeyList(referencedTable);

  const source = isUnique(
    referrerTableUniqueKeys,
    referrerColumnNames,
    referrerPrimaryKeys,
  )
    ? "1"
    : "m";
  const target = isUnique(
    referencedTableUniqueKeys,
    referencedColumnNames,
    referencedPrimaryKeys,
  )
    ? "1"
    : "n";
  const [markerStart, markerEnd] = {
    "m-n": ["prismaliser-many", "prismaliser-many"],
    "1-n": ["prismaliser-many", "prismaliser-one"],
    "1-1": ["prismaliser-one", "prismaliser-one"],
    "m-1": ["prismaliser-many", "prismaliser-one"],
  }[`${source}-${target}`];
  return { markerStart, markerEnd };
}

function getPrimaryKeyList(table: TableForSchemaListFragment): string[] {
  return table.columns.filter(ind => ind.isPrimaryKey).map(c => c.name);
}

function getUniqueKeyList(table: TableForSchemaListFragment): string[][] {
  return table.indexes
    .filter(ind => ind.type === "Unique")
    .map(ind => ind.columns.map(c => c.name));
}

function isUnique(
  uniqueKeys: string[][],
  foreignKeys: string[],
  primaryKeys: string[],
): boolean {
  const isPrimaryKey = primaryKeys.every(val => foreignKeys.includes(val));
  const isUniqueKey = uniqueKeys.some(uk =>
    uk.every(val => foreignKeys.includes(val)),
  );
  return isPrimaryKey || isUniqueKey;
}

export function getPaintedWidthAndHeight(
  nodes: Array<Node<NodeData>>,
): GetPaintedWidthAndHeightReturnType {
  const nodesArray = Array.from(nodes.values());
  const smallestX = Math.min(...nodesArray.map(n => n.position.x));
  const largestX = Math.max(
    ...nodesArray.map(n =>
      n.width ? n.position.x + n.width : n.position.x + 300,
    ),
  );
  const smallestY = Math.min(...nodesArray.map(n => n.position.y));
  const largestY = Math.max(
    ...nodesArray.map(n =>
      n.height ? n.height + n.position.y : n.position.y + 300,
    ),
  );
  const width = largestX - smallestX;
  const height = largestY - smallestY;
  return { width, height };
}

export function getZoomFactor(
  paintedWidth: number,
  paintedHeight: number,
  innerWidth: number,
  innerHeight: number,
): number {
  const zoom =
    (innerWidth - 200) / paintedWidth > (innerHeight - 260) / paintedHeight
      ? (innerHeight - 260) / paintedHeight
      : (innerWidth - 200) / paintedWidth;
  return zoom > 1 ? 1 : zoom;
}

export function getColType(colType: string): string {
  const isEnum = colType.toLowerCase().includes("enum");
  return isEnum ? "enum" : colType.split("COLLATE")[0];
}
