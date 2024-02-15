import Button from "@components/Button";
import ErrorMsg from "@components/ErrorMsg";
import FormInput from "@components/FormInput";
import { SmallLoader } from "@dolthub/react-components";
import { useSqlSelectForCsvDownloadQuery } from "@gen/graphql-types";
import { isTimeoutError } from "@lib/errors/helpers";
import { ModalProps } from "@lib/modalProps";
import { SqlQueryParams } from "@lib/params";
import { useState } from "react";
import Modal from "../Modal";
import DownloadForExcelHelpPopup from "./DownloadForExcelHelpPopup";
import css from "./index.module.css";
import { exportToCsv } from "./utils";

type Props = {
  params: SqlQueryParams;
} & ModalProps;

function Inner(props: Props) {
  const [fileName, setFileName] = useState(
    `${props.params.databaseName}_${props.params.refName}_${Date.now()}.csv`,
  );
  const { loading, error, data } = useSqlSelectForCsvDownloadQuery({
    variables: {
      ...props.params,
      queryString: props.params.q,
    },
  });

  if (loading) {
    return (
      <div>
        <SmallLoader.WithText loaded={false} text="Generating CSV..." />
      </div>
    );
  }

  if (!data || error) {
    return (
      <div>
        <p>There was an error generating the CSV for your query results.</p>
        <ErrorMsg err={error} />
        {error && isTimeoutError(error.message) && (
          <div>
            <p>
              We currently only support a limited result set size. It may help
              to try again using <code>LIMIT</code>.
            </p>
          </div>
        )}
      </div>
    );
  }

  const exportSql = async (includeBOM = false) => {
    await exportToCsv(data.sqlSelectForCsvDownload, fileName, includeBOM);
    props.setIsOpen(false);
  };

  return (
    <div>
      <p>
        There are {data.sqlSelectForCsvDownload.split("\r\n").length - 1} rows
        available for download.
      </p>
      <FormInput
        value={fileName}
        onChangeString={setFileName}
        label="File Name"
        className={css.fileName}
      />
      <Button.Group>
        <Button onClick={async () => exportSql()}>Export to CSV</Button>
        <Button onClick={async () => exportSql(true)}>
          Export to CSV for Excel
          <DownloadForExcelHelpPopup id={`${props.params.refName}-query`} />
        </Button>
      </Button.Group>
    </div>
  );
}

export default function CsvModal(props: Props) {
  return (
    <Modal
      onRequestClose={() => props.setIsOpen(false)}
      isOpen={props.isOpen}
      className={css.downloadCsv}
      title="Download query results"
    >
      <Inner {...props} />
    </Modal>
  );
}
