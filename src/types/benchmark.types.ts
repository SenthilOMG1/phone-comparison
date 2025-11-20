import { Provenance } from './provenance.types';

export interface GeekbenchScore {
  version: string;
  singleCore: {
    median: number;
    variance: number;
    sampleSize: number;
  };
  multiCore: {
    median: number;
    variance: number;
    sampleSize: number;
  };
  provenance: Provenance;
}

export interface AnTuTuScore {
  version: string;
  total: {
    median: number;
    variance: number;
    sampleSize: number;
  };
  breakdown: {
    cpu: number;
    gpu: number;
    memory: number;
    ux: number;
  };
  provenance: Provenance;
}

export interface GPUBenchmark {
  name: string;
  fps: number;
  resolution: string;
  settings: string;
  provenance: Provenance;
}

export interface BenchmarkData {
  geekbench?: GeekbenchScore;
  antutu?: AnTuTuScore;
  gpu?: GPUBenchmark[];
}
