import {
  Args,
  ArgsType,
  Field,
  Mutation,
  Query,
  Resolver,
} from "@nestjs/graphql";
import { ConnectionResolver } from "../connections/connection.resolver";
import { DBArgs, TagArgs } from "../utils/commonTypes";
import { Tag, TagList, fromDoltRowRes } from "./tag.model";
import {
  callDeleteTag,
  getCallNewTag,
  tagQuery,
  tagsQuery,
} from "./tag.queries";

// @InputType()
// class AuthorInfo {
//   @Field()
//   name: string;

//   @Field()
//   email: string;
// }

@ArgsType()
class CreateTagArgs extends TagArgs {
  @Field({ nullable: true })
  message?: string;

  @Field()
  fromRefName: string;

  // @Field({ nullable: true })
  // author?: AuthorInfo;
}

@Resolver(_of => Tag)
export class TagResolver {
  constructor(private readonly conn: ConnectionResolver) {}

  @Query(_returns => TagList)
  async tags(@Args() args: DBArgs): Promise<TagList> {
    const conn = this.conn.connection();
    return conn.query(async query => {
      const res = await query(tagsQuery);
      return {
        list: res.map(t => fromDoltRowRes(args.databaseName, t)),
      };
    }, args.databaseName);
  }

  @Query(_returns => Tag, { nullable: true })
  async tag(@Args() args: TagArgs): Promise<Tag | undefined> {
    const conn = this.conn.connection();
    return conn.query(async query => {
      const res = await query(tagQuery, [args.tagName]);
      if (!res.length) return undefined;
      return fromDoltRowRes(args.databaseName, res[0]);
    }, args.databaseName);
  }

  @Mutation(_returns => Tag)
  async createTag(@Args() args: CreateTagArgs): Promise<Tag> {
    const conn = this.conn.connection();
    return conn.query(async query => {
      await query(getCallNewTag(!!args.message), [
        args.tagName,
        args.fromRefName,
        args.message,
        // getAuthorString(args.author),
      ]);
      const res = await query(tagQuery, [args.tagName]);
      if (!res.length) throw new Error("Error creating tag");
      return fromDoltRowRes(args.databaseName, res[0]);
    }, args.databaseName);
  }

  @Mutation(_returns => Boolean)
  async deleteTag(@Args() args: TagArgs): Promise<boolean> {
    const conn = this.conn.connection();
    return conn.query(async query => {
      await query(callDeleteTag, [args.tagName]);
      return true;
    }, args.databaseName);
  }
}

// export type CommitAuthor = { name: string; email: string };

// function getAuthorString(commitAuthor?: CommitAuthor): string {
//   if (!commitAuthor) return "";
//   return `${commitAuthor.name} <${commitAuthor.email}>`;
// }
