import { Column } from "@gen/graphql-types";
import { Node } from "reactflow";

export type Position = {
  x: number;
  y: number;
};

export type NodeData = {
  tableName: string;
  columns: Column[];
  sourceHandles: Set<string>;
  targetHandles: Set<string>;
};

export type TableNode = {
  id: string;
  type: string;
  position: Position;
  data: NodeData;
};

export type Edge = {
  id: string;
  source: string;
  target: string;
  type: string;
  indexCount: number;
  sourceColumnIndexes: string;
  targetColumnName: string;
  sourceHandle: string;
  targetHandle: string;
  label: string;
};

export type TableRelations = {
  sourceCount: number;
  targetCount: number;
  target: Set<string>;
  targetIndexCount: { [key: string]: number };
};

export type Graph = { [key: string]: TableRelations };

export type VisitedMask = { [key: string]: number };

export type CalculatePositionReturnType = {
  graph: Graph;
  count: number;
  nodes: Array<Node<NodeData>>;
  visited: VisitedMask;
};

export type GetPaintedWidthAndHeightReturnType = {
  width: number;
  height: number;
};

export type GetRelationshipMarkerReturnType = {
  markerStart: string;
  markerEnd: string;
};
