export const addItem = jest.fn();

export const SqlEditorContextProviderValueMock = {
  setEditorString: jest.fn(),
  editorString: "",
  toggleSqlEditor: jest.fn(),
  showSqlEditor: false,
  executeQuery: addItem,
  queryClickHandler: jest.fn(),
  setError: jest.fn(),
  loading: false,
  modalState: {
    forkIsOpen: false,
    errorIsOpen: false,
  },
  setModalState: jest.fn(),
  executeSaveQuery: jest.fn(),
};
