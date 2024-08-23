import Page from "@components/util/Page";
import { UploadParams } from "@lib/params";
import FileUploadPage from "@pageComponents/FileUploadPage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: UploadParams & {
    branchName?: string | null;
    schemaName?: string | null;
    tableName?: string | null;
  };
};

const DatabaseUploadPage: NextPage<Props> = ({ params }) => (
  <Page title={`Upload file to ${params.databaseName}`} noIndex>
    <FileUploadPage
      params={{
        ...params,
        branchName: params.branchName ?? undefined,
        schemaName: params.schemaName ?? undefined,
        tableName: params.tableName ?? undefined,
      }}
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
        ...(params as UploadParams),
        branchName: query.branchName ? String(query.branchName) : null,
        schemaName: query.schemaName ? String(query.schemaName) : null,
        tableName: query.tableName ? String(query.tableName) : null,
      },
    },
  };
};

export default DatabaseUploadPage;
