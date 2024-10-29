import { FileType } from "@gen/graphql-types";
import { handleCaughtError } from "@lib/errors/helpers";
import { ChangeEvent, DragEvent, useEffect, useState } from "react";
import { useFileUploadContext } from "../../contexts/fileUploadLocalForage";
import useUploadContext from "./contexts/upload";

// set limit to prevent doing work on files that are
// too large for the server anyway
const oneMB = 1024 * 1024;
const numMB = 400;
const maxFileSize = numMB * oneMB; // ~ 150MB

export const validTypes = ["csv", "psv", "tsv"];

type ReturnType = {
  dragOver: (e: DragEvent<HTMLDivElement>) => void;
  dragLeave: (e: DragEvent<HTMLDivElement>) => void;
  onDropFile: (e: DragEvent<HTMLDivElement>) => Promise<void>;
  onChooseFile: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  err: string;
  hover: boolean;
};

export function useDropZone(): ReturnType {
  const { setState } = useUploadContext();
  const { state, setState: setFucState } = useFileUploadContext();
  const [err, setErr] = useState("");
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (err) {
      setState({ loading: false });
    }
  }, [err, setState]);

  useEffect(() => {
    if (!state.selectedFile) {
      setErr("");
    }
  }, [state.selectedFile, setErr]);

  const dragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHover(true);
  };

  const dragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHover(false);
  };

  const fileDrop = (files: FileList | null) => {
    setErr("");
    setState({ error: undefined, loading: true });

    if (!files?.length) {
      setErr("no files uploaded");
      return;
    }
    if (files.length > 1) {
      setErr("cannot upload more than one file");
      return;
    }
    const file = files[0];
    if (file.size > maxFileSize) {
      setErr(`file too large, must be < ${numMB}MB`);
      return;
    }
    const extension = getExtension(file);
    if (extension && validateFile(extension)) {
      try {
        const fileType = toFileType(extension);
        setFucState({
          selectedFile: file,
          fileType,
        });
      } catch (e) {
        handleCaughtError(e, er => setState({ error: er }));
      } finally {
        setState({ loading: false });
      }
    } else {
      setErr("file type not permitted");
    }
  };

  const onDropFile = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHover(false);
    fileDrop(e.dataTransfer.files);
  };

  const onChooseFile = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    fileDrop(e.target.files);
  };

  return {
    dragOver,
    dragLeave,
    onDropFile,
    onChooseFile,
    err,
    hover,
  };
}

function getExtension(file: File): string | undefined {
  return file.name.split(".").pop();
}

function validateFile(extension: string): boolean {
  return validTypes.indexOf(extension) !== -1;
}

function toFileType(extension: string): FileType {
  switch (extension) {
    case "csv":
      return FileType.Csv;
    case "psv":
      return FileType.Psv;
    case "tsv":
      return FileType.Tsv;
    default:
      throw new Error("invalid file type");
  }
}
