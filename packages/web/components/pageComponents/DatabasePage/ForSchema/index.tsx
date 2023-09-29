import SchemaDiagram from "@components/SchemaDiagram";
import { RefParams } from "@lib/params";
import DatabaseDesktopOnly from "../DatabaseDesktopOnly";
import DatabasePage from "../component";

type Props = {
  params: RefParams & { active?: string };
};

export default function ForSchema({ params }: Props) {
  return (
    <DatabaseDesktopOnly title="ER diagram" params={params}>
      <DatabasePage params={params} initialTabIndex={0} wide>
        <SchemaDiagram params={params} />
      </DatabasePage>
    </DatabaseDesktopOnly>
  );
}
