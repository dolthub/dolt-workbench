import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { ConnectionResolver } from "../connections/connection.resolver";
import { RefArgs } from "../utils/commonTypes";
import { DocType } from "./doc.enum";
import { Doc, DocList, fromDoltDocsRow } from "./doc.model";

@ArgsType()
class GetDefaultDocArgs extends RefArgs {
  @Field(_type => DocType, { nullable: true })
  docType?: DocType;
}

@Resolver(_of => Doc)
export class DocsResolver {
  constructor(private readonly conn: ConnectionResolver) {}

  @Query(_returns => DocList)
  async docs(
    @Args()
    args: RefArgs,
  ): Promise<DocList> {
    const conn = this.conn.connection();
    const docRows = await conn.getDocs(args);
    if (!docRows?.length) return { list: [] };
    const sortedDocs = docRows.sort(d =>
      d.doc_name === DocType.Readme ? -1 : 1,
    );
    return {
      list: sortedDocs.map(d => fromDoltDocsRow(args.refName, d)),
    };
  }

  @Query(_returns => Doc, { nullable: true })
  async docOrDefaultDoc(
    @Args() args: GetDefaultDocArgs,
  ): Promise<Doc | undefined> {
    const conn = this.conn.connection();
    const docRows = await conn.getDocs(args);
    if (!docRows?.length) return undefined;

    if (args.docType) {
      const doc = docRows.find(d => d.doc_name === args.docType);
      if (doc) {
        return fromDoltDocsRow(args.refName, doc);
      }
    }

    const sortedDocs = docRows.sort(d =>
      d.doc_name === DocType.Readme ? -1 : 1,
    );
    return fromDoltDocsRow(args.refName, sortedDocs[0]);
  }
}
