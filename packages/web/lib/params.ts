export type RefParams = {
  refName: string;
};

export type OptionalRefParams = {
  refName?: string;
};

export type DatabasePageParams = {
  refName?: string;
  tableName?: string;
  q?: string;
};

export type SqlQueryParams = RefParams & {
  q: string;
  active?: string;
};

export type TableParams = RefParams & {
  tableName: string;
};
