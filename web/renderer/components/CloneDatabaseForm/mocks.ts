import { MockedResponse } from "@apollo/client/testing";
import {
  CurrentConnectionDocument,
  DatabaseType,
  DoltCloneDocument,
} from "@gen/graphql-types";

export const mockConnection = {
  __typename: "DatabaseConnection" as const,
  connectionUrl: "localhost:3306",
  name: "test-connection",
  port: 3306,
  hideDoltFeatures: false,
  useSSL: false,
  type: DatabaseType.Mysql,
  isDolt: true,
  isLocalDolt: false,
};

export const currentConnectionMock: MockedResponse = {
  request: {
    query: CurrentConnectionDocument,
  },
  result: {
    data: {
      currentConnection: mockConnection,
    },
  },
};

export const currentConnectionNullMock: MockedResponse = {
  request: {
    query: CurrentConnectionDocument,
  },
  result: {
    data: {
      currentConnection: null,
    },
  },
};

export const postgresConnectionMock: MockedResponse = {
  request: {
    query: CurrentConnectionDocument,
  },
  result: {
    data: {
      currentConnection: {
        ...mockConnection,
        type: DatabaseType.Postgres,
      },
    },
  },
};

export const doltCloneMock: MockedResponse = {
  request: {
    query: DoltCloneDocument,
    variables: {
      ownerName: "dolthub",
      remoteDbName: "test-db",
      databaseName: "test-db",
    },
  },
  result: {
    data: {
      doltClone: {
        __typename: "DoltCloneResult",
        success: true,
      },
    },
  },
};

export const doltCloneFailMock: MockedResponse = {
  request: {
    query: DoltCloneDocument,
    variables: {
      ownerName: "dolthub",
      remoteDbName: "test-db",
      databaseName: "test-db",
    },
  },
  result: {
    data: {
      doltClone: {
        __typename: "DoltCloneResult",
        success: false,
      },
    },
  },
};
