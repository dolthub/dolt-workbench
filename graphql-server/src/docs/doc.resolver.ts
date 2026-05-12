import {
  Args,
  ArgsType,
  Field,
  Mutation,
  Query,
  Resolver,
} from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { MutationResult } from "../rows/rowMutation.resolver";
import { RefArgs } from "../utils/commonTypes";
import { DocType } from "./doc.enum";
import { Doc, DocList, fromDoltDocsRow } from "./doc.model";

@ArgsType()
class GetDefaultDocArgs extends RefArgs {
  @Field(_type => DocType, { nullable: true })
  docType?: DocType;
}

@ArgsType()
class SaveDocArgs extends RefArgs {
  @Field(_type => DocType)
  docType: DocType;

  @Field()
  markdown: string;
}

@Resolver(_of => Doc)
export class DocsResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Mutation(_returns => MutationResult)
  async saveDoc(@Args() args: SaveDocArgs): Promise<MutationResult> {
    const conn = this.conn.connection();
    return conn.saveDoc({
      databaseName: args.databaseName,
      refName: args.refName,
      docName: args.docType,
      markdown: args.markdown,
    });
  }

  @Query(_returns => DocList)
  async docs(
    @Args()
    args: RefArgs,
  ): Promise<DocList> {
    const conn = this.conn.connection();
    const docRows = await conn.getDocs(args);
    if (!docRows?.length) return { list: [] };
    return {
      list: docRows.map(d => fromDoltDocsRow(args.refName, d)),
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
