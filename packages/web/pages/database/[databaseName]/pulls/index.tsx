import Page from "@components/util/Page";
import Maybe from "@lib/Maybe";
import { DatabaseParams, MaybeRefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: MaybeRefParams & {
    from?: Maybe<string>;
    to?: Maybe<string>;
  };
  tableName?: Maybe<string>;
};

const PullsPage: NextPage<Props> = ({ params, tableName }) => (
  <Page title={`Viewing pulls for ${params.databaseName}`} noIndex>
    <DatabasePage.ForPulls
      params={{
        databaseName: params.databaseName,
        refName: params.refName ?? undefined,
        fromBranchName: params.from ?? undefined,
        toBranchName: params.to ?? undefined,
      }}
      tableName={tableName ?? undefined}
    />
  </Page>
);

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  query,
}) => {
  return {
    props: {
      params: {
        ...(params as DatabaseParams),
        refName: query.refName ? String(query.refName) : null,
        from: query.from ? String(query.from) : null,
        to: query.to ? String(query.to) : null,
      },
      tableName: query.tableName ? String(query.tableName) : null,
    },
  };
};

export default PullsPage;
