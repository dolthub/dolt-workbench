import { QueryFactory } from "..";
import { SqliteQueryFactory } from "../sqlite";

export class DoltLiteQueryFactory
  extends SqliteQueryFactory
  implements QueryFactory
{
  isDolt = true;
}
