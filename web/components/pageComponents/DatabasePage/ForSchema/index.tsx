import SchemaDiagram from "@components/SchemaDiagram";
import SchemaDiagramBreadcrumbs from "@components/breadcrumbs/SchemaDiagramBreadcrumbs";
import { RefMaybeSchemaParams } from "@lib/params";
import { schemaDiagram } from "@lib/urls";
import DatabaseDesktopOnly from "../DatabaseDesktopOnly";
import DatabasePage from "../component";

type Props = {
  params: RefMaybeSchemaParams & { active?: string };
};

export default function ForSchema({ params }: Props) {
  return (
    <DatabaseDesktopOnly
      title="ER diagram"
      params={params}
      routeRefChangeTo={schemaDiagram}
    >
      <DatabasePage
        params={params}
        initialTabIndex={0}
        smallHeaderBreadcrumbs={<SchemaDiagramBreadcrumbs params={params} />}
        wide
        routeRefChangeTo={schemaDiagram}
      >
        <SchemaDiagram params={params} />
      </DatabasePage>
    </DatabaseDesktopOnly>
  );
}
