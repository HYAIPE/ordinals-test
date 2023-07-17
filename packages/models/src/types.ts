export interface IPaginatedResult<T> {
  items: T[];
  cursor: string | null;
  count: number;
  size: number;
  page: number;
}

export interface IProjectionOptions {
  attributes?: string[];
}

export interface IPaginationOptions {
  cursor?: string;
  limit?: number;
}

export interface IPaginationCursor {
  lastEvaluatedKey: any;
  page: number;
  count: number;
}
