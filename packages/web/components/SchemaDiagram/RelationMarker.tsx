export default function RelationMarker() {
  return (
    <svg width="0" height="0">
      <defs>
        <marker
          id="prismaliser-one"
          markerWidth="14"
          markerHeight="14"
          viewBox="-10 -10 20 20"
          orient="auto-start-reverse"
          refX="0"
          refY="0"
        >
          <polyline
            className="text-gray-400 stroke-current"
            strokeWidth="3"
            strokeLinecap="square"
            fill="none"
            points="-10,-8 -10,8"
          />
        </marker>

        <marker
          id="prismaliser-many"
          markerWidth="14"
          markerHeight="14"
          viewBox="-10 -10 20 20"
          orient="auto-start-reverse"
          refX="0"
          refY="0"
        >
          <polyline
            className="text-gray-400 stroke-current"
            strokeLinejoin="round"
            strokeLinecap="square"
            strokeWidth="1.5"
            fill="none"
            points="0,-8 -10,0 0,8"
          />
        </marker>
      </defs>
    </svg>
  );
}
