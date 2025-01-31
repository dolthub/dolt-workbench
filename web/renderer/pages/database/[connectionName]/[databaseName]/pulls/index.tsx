import Page from "@components/util/Page";
import { Maybe } from "@dolthub/web-utils";
import { DatabaseParams, MaybeRefParams } from "@lib/params";
import DatabasePage from "@pageComponents/DatabasePage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: MaybeRefParams & {
    from?: Maybe<string>;
  };
};

const PullsPage: NextPage<Props> = ({ params }) => (
  <Page title={`Viewing pulls for ${params.databaseName}`} noIndex>
    <DatabasePage.ForPulls
      params={{
        connectionName: params.connectionName,
        databaseName: params.databaseName,
        refName: params.refName ?? undefined,
        fromBranchName: params.from ?? undefined,
      }}
    />
  </Page>
);

// #!if !isElectron
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
      },
    },
  };
};
// #!endif

export default PullsPage;
