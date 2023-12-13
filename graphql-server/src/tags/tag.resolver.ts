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
    const res = await conn.getTags(args);
    return {
      list: res.map(t => fromDoltRowRes(args.databaseName, t)),
    };
  }

  @Query(_returns => Tag, { nullable: true })
  async tag(@Args() args: TagArgs): Promise<Tag | undefined> {
    const conn = this.conn.connection();
    const res = await conn.getTag(args);
    if (!res?.length) return undefined;
    return fromDoltRowRes(args.databaseName, res[0]);
  }

  @Mutation(_returns => String)
  async createTag(@Args() args: CreateTagArgs): Promise<string> {
    const conn = this.conn.connection();
    await conn.createNewTag(args);
    return args.tagName;
  }

  @Mutation(_returns => Boolean)
  async deleteTag(@Args() args: TagArgs): Promise<boolean> {
    const conn = this.conn.connection();
    await conn.callDeleteTag(args);
    return true;
  }
}

// TODO: commit author
// export type CommitAuthor = { name: string; email: string };

// function getAuthorString(commitAuthor?: CommitAuthor): string {
//   if (!commitAuthor) return "";
//   return `${commitAuthor.name} <${commitAuthor.email}>`;
// }
