import { Provenance } from './provenance.types';

export interface DisplaySpecs {
  sizeInches: number;
  type: 'OLED' | 'AMOLED' | 'LCD' | 'IPS' | 'Super AMOLED' | 'LTPO OLED';
  resolution: {
    width: number;
    height: number;
  };
  refreshRate: number;
  peakBrightness?: number;
  hdr?: boolean;
  protectionGlass?: string;
  provenance: Provenance;
}

export interface CameraSpecs {
  main: {
    megapixels: number;
    aperture: number;
    sensorSize?: number;
    pixelSize?: number;
    stabilization?: 'OIS' | 'EIS' | 'OIS+EIS';
    focalLength?: number;
  };
  ultrawide?: {
    megapixels: number;
    aperture: number;
    fov?: number;
  };
  telephoto?: {
    megapixels: number;
    aperture: number;
    opticalZoom?: number;
  };
  front: {
    megapixels: number;
    aperture: number;
  };
  video: {
    maxResolution: string;
    maxFps: number;
    stabilization?: boolean;
    hdr?: boolean;
  };
  provenance: Provenance;
}

export interface CameraScore {
  overall: number;
  photo: number;
  video: number;
  zoom: number;
  night: number;
  portrait: number;
  methodology: string;
  provenance: Provenance;
}

export interface SoCSpecs {
  family: 'Snapdragon' | 'Dimensity' | 'Exynos' | 'Kirin' | 'Apple' | 'Tensor';
  model: string;
  process: string;
  cpu: {
    cores: number;
    architecture: string;
  };
  gpu: string;
  provenance: Provenance;
}

export interface BatterySpecs {
  capacityMah: number;
  wiredCharging?: number;
  wirelessCharging?: number;
  reverseCharging?: boolean;
  chargingTime?: {
    to50Percent?: number;
    to100Percent?: number;
  };
  provenance: Provenance;
}

export interface ConnectivitySpecs {
  wifi: string[];
  bluetooth: string;
  nfc: boolean;
  usb: string;
  sim: string;
  fiveG: boolean;
  provenance: Provenance;
}

export interface DesignSpecs {
  weightGrams: number;
  dimensions: {
    heightMm: number;
    widthMm: number;
    thicknessMm: number;
  };
  materials: {
    front?: string;
    back?: string;
    frame?: string;
  };
  ipRating?: string;
  colors: string[];
  provenance: Provenance;
}

export interface SoftwareSpecs {
  os: string;
  version: string;
  skinName?: string;
  updatePromise?: string;
  provenance: Provenance;
}

export interface PhoneSpecs {
  display: DisplaySpecs;
  camera: CameraSpecs;
  cameraScore?: CameraScore;
  soc: SoCSpecs;
  ram: number[];
  storage: number[];
  battery: BatterySpecs;
  connectivity: ConnectivitySpecs;
  design: DesignSpecs;
  software: SoftwareSpecs;
}
