export type DataSource =
  | 'manufacturer'
  | 'gsmarena'
  | 'devicespecifications'
  | 'notebookcheck'
  | 'dxomark'
  | 'geekbench'
  | 'antutu';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface Provenance {
  source: DataSource;
  url?: string;
  lastChecked: string;
  confidence: ConfidenceLevel;
  notes?: string;
}

export interface ProvenanceField<T> {
  value: T;
  provenance: Provenance;
}

export interface DataConflict {
  field: string;
  sources: {
    source: DataSource;
    value: any;
    confidence: ConfidenceLevel;
  }[];
  resolution?: {
    chosenSource: DataSource;
    reason: string;
  };
}
