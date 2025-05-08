export interface BindingValue {
  type: string;
  value: string;
  datatype?: string;
}

export interface Binding {
  [key: string]: BindingValue;
}

export interface SparqlJsonResult {
  head: {
    link: any[];
    vars: string[];
  };
  results: {
    distinct: boolean;
    ordered: boolean;
    bindings: Binding[];
  };
}

export interface ProcessingStatus {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  message: string;
}

export interface Column {
  id: string;
  header: string;
  accessorFn: (row: Binding) => string;
}