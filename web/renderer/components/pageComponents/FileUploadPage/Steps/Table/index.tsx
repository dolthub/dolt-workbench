import { Selector as SchemasSelector } from "@components/SchemasSelector";
import TableSelector from "@components/TableSelector";
import { ErrorMsg, Loader } from "@dolthub/react-components";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import StepLayout from "../../StepLayout";
import UploadQueryInfo from "../../UploadQueryInfo";
import { useFileUploadContext } from "../../contexts/fileUploadLocalForage";
import { UploadStage } from "../../enums";
import TableOption from "./TableOption";
import css from "./index.module.css";
import useTable from "./useTable";

export default function Table() {
  const { initialLoad, error } = useFileUploadContext();

  if (initialLoad) return <Loader loaded={false} />;
  if (error) return <ErrorMsg err={error} />;

  return <Inner />;
}

function Inner() {
  const {
    dbParams,
    updateLoad,
    error,
    state: { branchName, schemaName },
    getUploadUrl,
  } = useFileUploadContext();
  const { onNext, disabled, state, setState } = useTable();
  const { isPostgres } = useDatabaseDetails(dbParams.connectionName);

  return (
    <StepLayout
      title="Choose a table name"
      stage={UploadStage.Table}
      onNext={onNext}
      disabled={disabled}
      backUrl={getUploadUrl("branch")}
      onWrongStage={!branchName}
      dataCy="table"
    >
      <div>
        <Loader loaded={!updateLoad} />
        <div className={css.container}>
          <TableOption title="Update an existing table">
            <div>
              {isPostgres && (
                <div>
                  <SchemasSelector
                    className={css.schemaSelector}
                    val={state.schemaName}
                    onChangeValue={v => {
                      setState({
                        existingTable: undefined,
                        schemaName: v ?? undefined,
                      });
                    }}
                    params={{ ...dbParams, refName: branchName, schemaName }}
                  />
                </div>
              )}
              <TableSelector
                params={{
                  ...dbParams,
                  refName: branchName,
                  schemaName: state.schemaName,
                }}
                selectedTable={state.existingTable}
                onChangeTable={t => setState({ existingTable: t ?? undefined })}
                label={isPostgres ? "Table" : undefined}
                light
              />
              <UploadQueryInfo
                tableName={state.existingTable}
                hideModifierOptions
                connectionName={dbParams.connectionName}
              />
            </div>
          </TableOption>
        </div>
        <ErrorMsg errString={state.err || state.valErr} err={error} />
      </div>
    </StepLayout>
  );
}
