type DownloadFileProps = {
  data: string;
  fileName: string;
  fileType: string;
};

function downloadFile({ data, fileName, fileType }: DownloadFileProps) {
  // Create a blob with the data we want to download as a file
  const blob = new Blob([data], { type: fileType });
  // Create an anchor element and dispatch a click event on it
  // to trigger a download
  const a = document.createElement("a");
  a.download = fileName;
  a.href = window.URL.createObjectURL(blob);
  const clickEvt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  a.dispatchEvent(clickEvt);
  a.remove();
}

export async function exportToCsv(
  csv: string,
  fileName: string,
  includeBOM: boolean,
) {
  downloadFile({
    data: includeBOM ? `\ufeff${csv}` : csv,
    fileName,
    fileType: "text/csv",
  });
}
