import {
  Args,
  ArgsType,
  Field,
  Mutation,
  Query,
  Resolver,
} from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { AuthorInfo, DBArgs, TagArgs } from "../utils/commonTypes";
import { Tag, TagList, fromDoltRowRes } from "./tag.model";

@ArgsType()
class CreateTagArgs extends TagArgs {
  @Field({ nullable: true })
  message?: string;

  @Field()
  fromRefName: string;

  @Field({ nullable: true })
  author?: AuthorInfo;
}

@Resolver(() => Tag)
export class TagResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(() => TagList)
  async tags(@Args() args: DBArgs): Promise<TagList> {
    const conn = this.conn.connection();
    const res = await conn.getTags(args);
    return {
      list: res.map(t => fromDoltRowRes(args.databaseName, t)),
    };
  }

  @Query(() => Tag, { nullable: true })
  async tag(@Args() args: TagArgs): Promise<Tag | undefined> {
    const conn = this.conn.connection();
    const res = await conn.getTag(args);
    if (!res) return undefined;
    return fromDoltRowRes(args.databaseName, res);
  }

  @Mutation(() => String)
  async createTag(@Args() args: CreateTagArgs): Promise<string> {
    const conn = this.conn.connection();
    await conn.createNewTag(args);
    return args.tagName;
  }

  @Mutation(() => Boolean)
  async deleteTag(@Args() args: TagArgs): Promise<boolean> {
    const conn = this.conn.connection();
    await conn.callDeleteTag(args);
    return true;
  }
}
