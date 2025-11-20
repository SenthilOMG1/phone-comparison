export const scoringConfig = {
  thresholds: {
    major: 0.25,
    notable: 0.10,
    minor: 0.05,
  },

  cameraWeights: {
    mainMegapixels: 0.15,
    sensorSize: 0.25,
    aperture: 0.20,
    stabilization: 0.20,
    zoom: 0.10,
    videoCapabilities: 0.10,
  },

  performanceWeights: {
    geekbenchSingle: 0.25,
    geekbenchMulti: 0.25,
    antutuTotal: 0.30,
    gpu: 0.20,
  },

  batteryWeights: {
    capacity: 0.40,
    wiredCharging: 0.30,
    wirelessCharging: 0.15,
    efficiency: 0.15,
  },

  displayWeights: {
    type: 0.25,
    refreshRate: 0.25,
    brightness: 0.25,
    resolution: 0.15,
    size: 0.10,
  },

  valueWeights: {
    specsPerDollar: 0.40,
    buildQuality: 0.20,
    brandReputation: 0.15,
    softwareSupport: 0.15,
    warrantyAndService: 0.10,
  },

  normalizationRanges: {
    camera: {
      megapixels: { min: 12, max: 200 },
      sensorSize: { min: 0.5, max: 1.5 },
      aperture: { min: 2.8, max: 1.4 },
    },
    performance: {
      geekbenchSingle: { min: 500, max: 2500 },
      geekbenchMulti: { min: 1500, max: 7000 },
      antutu: { min: 200000, max: 1500000 },
    },
    battery: {
      capacity: { min: 3000, max: 6000 },
      charging: { min: 15, max: 150 },
    },
    display: {
      refreshRate: { min: 60, max: 144 },
      brightness: { min: 500, max: 2000 },
    },
  },
};
