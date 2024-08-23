import Link from "@components/links/Link";
import { Button } from "@dolthub/react-components";
import { RefOptionalSchemaParams } from "@lib/params";
import { ref, schemaDiagram } from "@lib/urls";
import { AiOutlineClose } from "@react-icons/all-files/ai/AiOutlineClose";
import { FaProjectDiagram } from "@react-icons/all-files/fa/FaProjectDiagram";
import { useRouter } from "next/router";
import css from "./index.module.css";

type Props = {
  params: RefOptionalSchemaParams;
};

export default function SchemaDiagramButton(props: Props) {
  const router = useRouter();
  const isShowingSchemaDiagram =
    router.pathname === "/database/[databaseName]/schema/[refName]";

  const url = isShowingSchemaDiagram ? ref : schemaDiagram;

  return (
    <Link {...url(props.params)}>
      <Button
        red={isShowingSchemaDiagram}
        className={css.diagram}
        data-cy="er-diagram-button"
      >
        {isShowingSchemaDiagram ? (
          <>
            <AiOutlineClose />
            Hide ER Diagram
          </>
        ) : (
          <>
            <FaProjectDiagram />
            ER Diagram
          </>
        )}
      </Button>
    </Link>
  );
}
