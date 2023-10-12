import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { DataSourceService } from "../dataSources/dataSource.service";
import { RefArgs } from "../utils/commonTypes";
import { DocType } from "./doc.enum";
import { Doc, DocList, fromDoltDocsRow } from "./doc.model";
import { docQuery, docsQuery } from "./docs.queries";

@ArgsType()
export class GetDocArgs extends RefArgs {
  @Field(_type => DocType)
  docType: DocType;
}

@ArgsType()
export class GetDefaultDocArgs extends RefArgs {
  @Field(_type => DocType, { nullable: true })
  docType?: DocType;
}

@Resolver(_of => Doc)
export class DocsResolver {
  constructor(private readonly dss: DataSourceService) {}

  @Query(_returns => DocList)
  async docs(
    @Args()
    args: RefArgs,
  ): Promise<DocList> {
    return this.dss.query(
      async query => {
        const docRows = await query(docsQuery);
        if (!docRows.length) return { list: [] };
        const sortedDocs = docRows.sort(d =>
          d.doc_name === DocType.Readme ? -1 : 1,
        );
        return {
          list: sortedDocs.map(d => fromDoltDocsRow(args.refName, d)),
        };
      },
      args.databaseName,
      args.refName,
    );
  }

  @Query(_returns => Doc, { nullable: true })
  async doc(@Args() args: GetDocArgs): Promise<Doc | undefined> {
    return this.dss.query(
      async query => {
        const doc = await query(docQuery, [args.docType]);
        if (!doc.length) return undefined;
        return fromDoltDocsRow(args.refName, doc[0]);
      },
      args.databaseName,
      args.refName,
    );
  }

  @Query(_returns => Doc, { nullable: true })
  async docOrDefaultDoc(
    @Args() args: GetDefaultDocArgs,
  ): Promise<Doc | undefined> {
    return this.dss.query(
      async query => {
        const docRows = await query(docsQuery);
        if (!docRows.length) return { list: [] };

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
      },
      args.databaseName,
      args.refName,
    );
  }
}
