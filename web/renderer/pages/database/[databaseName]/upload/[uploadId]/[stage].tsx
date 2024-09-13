import Page from "@components/util/Page";
import { UploadParams } from "@lib/params";
import FileUploadPage from "@pageComponents/FileUploadPage";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  params: UploadParams & {
    branchName?: string | null;
    schemaName?: string | null;
    tableName?: string | null;
    stage?: string | null;
  };
};

const DatabaseUploadStagePage: NextPage<Props> = ({ params }) => (
  <Page
    title={`Upload file to ${params.databaseName} - ${params.stage ?? "Branch"}`}
    noIndex
  >
    <FileUploadPage
      params={{
        ...params,
        branchName: params.branchName ?? undefined,
        schemaName: params.schemaName ?? undefined,
        tableName: params.tableName ?? undefined,
      }}
      stage={params.stage ?? undefined}
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
        ...(params as UploadParams),
        branchName: query.branchName ? String(query.branchName) : null,
        schemaName: query.schemaName ? String(query.schemaName) : null,
        tableName: query.tableName ? String(query.tableName) : null,
        id: query.id ? String(query.id) : null,
        stage: params?.stage ? String(params.stage) : null,
      },
    },
  };
};
// #!endif

export default DatabaseUploadStagePage;
