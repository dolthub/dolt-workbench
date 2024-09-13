import Page from "@components/util/Page";
import { DatabaseParams } from "@lib/params";
import FileUploadPage from "@pageComponents/FileUploadPage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: DatabaseParams & {
    tableName?: string | null;
    schemaName?: string | null;
    branchName?: string | null;
  };
};

const DatabaseUploadPage: NextPage<Props> = ({ params }) => (
  <Page title={`Upload file to ${params.databaseName}`} noIndex>
    <FileUploadPage
      params={{
        ...params,
        uploadId: String(Date.now()),
        branchName: params.branchName ?? undefined,
        schemaName: params.schemaName ?? undefined,
        tableName: params.tableName ?? undefined,
      }}
    />
  </Page>
);

// #!if isWeb
export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  query,
}) => {
  return {
    props: {
      params: {
        ...(params as DatabaseParams),
        branchName: query.branchName ? String(query.branchName) : null,
        schemaName: query.schemaName ? String(query.schemaName) : null,
        tableName: query.tableName ? String(query.tableName) : null,
      },
    },
  };
};
// #!endif

export default DatabaseUploadPage;
