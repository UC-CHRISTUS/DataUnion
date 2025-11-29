/**
 * AG-Grid type definitions (simplified for our use case)
 * These are defined locally to avoid module resolution issues with ag-grid-community types
 */

export interface AGGridApi {
  refreshCells: (params: { rowNodes?: unknown[]; columns?: unknown[]; force?: boolean }) => void;
  stopEditing: (cancel?: boolean) => void;
  showLoadingOverlay: () => void;
  hideOverlay: () => void;
}

export interface AGCellRendererParams<TData = unknown> {
  value: unknown;
  data?: TData;
  node?: unknown;
  api: AGGridApi;
}

export interface AGValueSetterParams<TData = unknown> {
  data?: TData;
  newValue: unknown;
  oldValue?: unknown;
  node?: unknown;
  column?: unknown;
  api: AGGridApi;
}

export interface AGValueFormatterParams<TData = unknown> {
  value: unknown;
  data?: TData;
}

export interface AGValueParserParams<TData = unknown> {
  newValue: unknown;
  data?: TData;
}

export interface AGCellClassParams<TData = unknown> {
  data?: TData;
  value?: unknown;
}

export interface AGGetRowsParams {
  startRow: number;
  endRow: number;
  successCallback: (rows: unknown[], lastRow: number) => void;
  failCallback: () => void;
}

export interface AGColDef<TData = unknown> {
  headerName?: string;
  field?: string;
  sortable?: boolean;
  resizable?: boolean;
  filter?: boolean;
  editable?: boolean | ((params: { data?: TData }) => boolean);
  valueParser?: (params: AGValueParserParams<TData>) => unknown;
  valueSetter?: (params: AGValueSetterParams<TData>) => boolean;
  valueFormatter?: (params: AGValueFormatterParams<TData>) => string;
  cellStyle?: (params: AGCellClassParams<TData>) => React.CSSProperties | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cellRenderer?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cellEditor?: any;
  cellEditorPopup?: boolean;
  cellEditorParams?: Record<string, unknown>;
  singleClickEdit?: boolean;
  onCellClicked?: (params: { data?: TData; api: AGGridApi }) => void;
}

export interface AGGridRef {
  api: AGGridApi;
}
