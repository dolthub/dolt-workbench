import Page404 from "@components/Page404";
import { Loader, QueryHandler } from "@dolthub/react-components";
import { useDefaultBranchPageQuery } from "@gen/graphql-types";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import useRole from "@hooks/useRole";
import { DatabaseParams, UploadParamsWithOptions } from "@lib/params";
import { ReactNode } from "react";
import Layout from "./Layout";
import { FileUploadLocalForageProvider } from "./contexts/fileUploadLocalForage";
import css from "./index.module.css";

type Props = {
  params: UploadParamsWithOptions;
  children: ReactNode;
};

export default function PageWrapper(props: Props) {
  const doltRes = useDatabaseDetails();
  const { userHasWritePerms, loading } = useRole();
  const res = useDefaultBranchPageQuery({
    variables: { ...props.params, filterSystemTables: true },
  });
  const dbParams = {
    databaseName: props.params.databaseName,
    schemaName: props.params.schemaName,
  };

  if (loading || doltRes.loading) return <Loader loaded={false} />;
  if (!userHasWritePerms) return <PermsError params={dbParams} />;

  return (
    <Layout params={dbParams}>
      <QueryHandler
        result={res}
        render={() => (
          <FileUploadLocalForageProvider
            params={props.params}
            isDolt={doltRes.isDolt}
          >
            {props.children}
          </FileUploadLocalForageProvider>
        )}
      />
    </Layout>
  );
}

function PermsError(props: { params: DatabaseParams }) {
  return (
    <Layout params={props.params}>
      <div>
        <Page404
          title={`Cannot edit ${props.params.databaseName}`}
          error={new Error("must have write permissions to edit data")}
        >
          <div className={css.noPerms}>
            <div>
              You must have write permissions to create a new table or upload a
              file
            </div>
          </div>
        </Page404>
      </div>
    </Layout>
  );
}
