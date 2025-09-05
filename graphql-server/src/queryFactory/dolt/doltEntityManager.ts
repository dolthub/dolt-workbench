import { EntityManager, InsertResult } from "typeorm";
import { SchemaType } from "../../schemas/schema.enums";
import { SchemaItem } from "../../schemas/schema.model";
import { DoltSystemTable } from "../../systemTables/systemTable.enums";
import { ROW_LIMIT, handleTableNotFound } from "../../utils";
import { tableWithSchema } from "../postgres/utils";
import * as t from "../types";
import { getOrderByColForBranches } from "./queries";
import { TestArgs } from "../types";

export async function getDoltSchemas(
  em: EntityManager,
  type?: SchemaType,
  pgSchema?: string,
): Promise<SchemaItem[]> {
  let sel = em
    .createQueryBuilder()
    .select("*")
    .from(
      pgSchema
        ? tableWithSchema({
            tableName: DoltSystemTable.SCHEMAS,
            schemaName: pgSchema,
          })
        : DoltSystemTable.SCHEMAS,
      DoltSystemTable.SCHEMAS,
    );
  if (type) {
    sel = sel.where(`${DoltSystemTable.SCHEMAS}.type = :type`, {
      type,
    });
  }
  const res = await handleTableNotFound(async () => sel.getRawMany());
  if (!res) return [];
  return res.map(r => {
    return { name: r.name, type: r.type };
  });
}

export async function getDoltProcedures(
  em: EntityManager,
): Promise<SchemaItem[]> {
  const sel = em
    .createQueryBuilder()
    .select("*")
    .from(DoltSystemTable.PROCEDURES, "");
  const res = await handleTableNotFound(async () => sel.getRawMany());
  if (!res) return [];
  return res.map(r => {
    return {
      name: r.name,
      type: SchemaType.Procedure,
    };
  });
}

export async function getDoltBranch(
  em: EntityManager,
  args: t.BranchArgs,
): t.USPR {
  return em
    .createQueryBuilder()
    .select("*")
    .from("dolt_branches", "")
    .where(`dolt_branches.name = :name`, {
      name: args.branchName,
    })
    .getRawOne();
}

async function getDoltBranchesQB(
  em: EntityManager,
  args: {
    limit: number;
    offset?: number;
    orderBy?: string;
    dir?: "ASC" | "DESC";
  },
): t.PR {
  let sel = em.createQueryBuilder().select("*").from("dolt_branches", "");

  if (args.orderBy && args.dir) {
    sel = sel.addOrderBy(args.orderBy, args.dir);
  }
  if (args.offset !== undefined) {
    sel = sel.offset(args.offset);
  }

  return sel.limit(args.limit).getRawMany();
}

async function getDoltRemoteBranchesQB(
  em: EntityManager,
  args: {
    remoteName: string;
    limit: number;
    offset?: number;
  },
): t.PR {
  let sel = em
    .createQueryBuilder()
    .select("*")
    .from("dolt_remote_branches", "")
    .where("name like 'remotes/" + args.remoteName + "/%'");

  if (args.offset !== undefined) {
    sel = sel.offset(args.offset);
  }

  return sel.limit(args.limit).getRawMany();
}

export async function getDoltBranchesPaginated(
  em: EntityManager,
  args: t.ListBranchesArgs,
): t.PR {
  const [orderBy, dir] = getOrderByColForBranches(args.sortBy);
  return getDoltBranchesQB(em, {
    limit: ROW_LIMIT + 1,
    offset: args.offset,
    orderBy,
    dir,
  });
}

export async function getDoltRemoteBranchesPaginated(
  em: EntityManager,
  args: t.RemoteBranchesArgs,
): t.PR {
  return getDoltRemoteBranchesQB(em, {
    remoteName: args.remoteName,
    limit: ROW_LIMIT + 1,
    offset: args.offset,
  });
}

export async function getAllDoltBranches(em: EntityManager): t.PR {
  return getDoltBranchesQB(em, { limit: 1000 });
}

export async function getDoltDocs(em: EntityManager): t.UPR {
  const sel = em
    .createQueryBuilder()
    .select("*")
    .from(DoltSystemTable.DOCS, "")
    .orderBy("doc_name", "DESC");
  return handleTableNotFound(async () => sel.getRawMany());
}

export async function getDoltStatus(em: EntityManager): t.PR {
  return em
    .createQueryBuilder()
    .select("*")
    .from("dolt_status", "")
    .getRawMany();
}

export async function getDoltTag(em: EntityManager, args: t.TagArgs): t.UPR {
  return em
    .createQueryBuilder()
    .select("*")
    .from("dolt_tags", "")
    .where("dolt_tags.tag_name = :name", { name: args.tagName })
    .getRawOne();
}

export async function getDoltTags(em: EntityManager): t.PR {
  return em
    .createQueryBuilder()
    .select("*")
    .from("dolt_tags", "")
    .orderBy("dolt_tags.date", "DESC")
    .getRawMany();
}

export async function getDoltRemotesPaginated(
  em: EntityManager,
  args: t.ListRemotesArgs,
): t.PR {
  return em
    .createQueryBuilder()
    .select("*")
    .from("dolt_remotes", "")
    .offset(args.offset)
    .limit(ROW_LIMIT + 1)
    .getRawMany();
}

export async function getDoltTests(
  em: EntityManager,
): t.PR {
  return em
    .createQueryBuilder()
    .select("*")
    .from("dolt_tests", "")
    .getRawMany();
}

export async function saveDoltTests(
  em: EntityManager,
  tests: TestArgs[]
): Promise<InsertResult> {
  return em.transaction(async (transactionalEntityManager) => {
    await transactionalEntityManager
      .createQueryBuilder()
      .delete()
      .from("dolt_tests")
      .execute();

    return transactionalEntityManager
      .createQueryBuilder()
      .insert()
      .into("dolt_tests")
      .values(
        tests.map(t => {
            return {
              test_name: t.testName,
              test_group: t.testGroup,
              test_query: t.testQuery,
              assertion_type: t.assertionType,
              assertion_comparator: t.assertionComparator,
              assertion_value: t.assertionValue
            }
          }
        )
      )
      .execute();
  });
}
