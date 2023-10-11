import QueryHandler from "@components/util/QueryHandler";
import { TableForSchemaListFragment } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { ref } from "@lib/urls";
import { AiOutlineClose } from "@react-icons/all-files/ai/AiOutlineClose";
import Image from "next/legacy/image"; // TODO: Migrate to current next/image
import { useRouter } from "next/router";
import ReactFlow, {
  ConnectionLineType,
  ControlButton,
  Controls,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useStore,
} from "react-flow-renderer";
import RelationMarker from "./RelationMarker";
import TableNode from "./TableNode";
import css from "./index.module.css";
import useTableList from "./useTableList";
import {
  getInitialEdges,
  getInitialNodes,
  getLayout,
  getPaintedWidthAndHeight,
  getZoomFactor,
} from "./utils";

type Props = {
  params: RefParams;
};

type InnerProps = {
  tables: TableForSchemaListFragment[];
} & Props;

const nodeTypes = { tableNode: TableNode };

function Inner(props: InnerProps) {
  const initialEdges = getInitialEdges(props.tables);
  const { nodes: initialNodes, graph } = getInitialNodes(
    props.tables,
    initialEdges,
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const router = useRouter();

  const onClose = () => {
    const { href, as } = ref(props.params);
    router.push(href, as).catch(() => {});
  };

  const { nodeInternals } = useStore();
  const { setViewport } = useReactFlow();

  // the automatically painted width might exceed the outer container width, rescale the canvas when onload
  const onload = () => {
    const newNodes = getLayout(graph, nodeInternals);
    setNodes(newNodes);
    const { width: paintedWidth, height: paintedHeight } =
      getPaintedWidthAndHeight(newNodes);
    const { innerWidth, innerHeight } = window;
    const zoom = getZoomFactor(
      paintedWidth,
      paintedHeight,
      innerWidth,
      innerHeight,
    );

    setViewport({
      x: (innerWidth - 100 - paintedWidth * zoom) / 2,
      y: (innerHeight - 160 - paintedHeight * zoom) / 2,
      zoom,
    });
  };

  return (
    <div className={css.layoutFlow} data-cy="er-diagram-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionLineType={ConnectionLineType.SmoothStep}
        onInit={onload}
        minZoom={0.2}
        fitView
      >
        <Controls
          style={{ top: "20px", right: "15px", left: "auto", bottom: "auto" }}
        >
          <ControlButton
            onClick={onClose}
            className={css.closeButton}
            data-cy="er-diagram-close-control-button"
          >
            <AiOutlineClose />
          </ControlButton>
        </Controls>
        <div className={css.notation} data-cy="er-diagram-notation">
          <Image
            src="/images/ERDNotation.png"
            alt="ERDNotation"
            height={62}
            width={100}
          />
        </div>
      </ReactFlow>
      <RelationMarker />
    </div>
  );
}

export default function SchemaDiagram(props: Props) {
  const res = useTableList(props.params);

  return (
    <ReactFlowProvider>
      <QueryHandler
        result={{ ...res, data: res.tables }}
        render={data => <Inner {...props} tables={data} />}
      />
    </ReactFlowProvider>
  );
}
