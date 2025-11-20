import { PersonaConfig } from '../types';

export const personasConfig: PersonaConfig = {
  default: 'photographer',
  personas: {
    photographer: {
      id: 'photographer',
      name: 'Photographer',
      description: 'Prioritizes camera quality, sensor specs, and image processing capabilities',
      icon: 'Camera',
      weights: {
        camera: 0.45,
        performance: 0.15,
        battery: 0.15,
        display: 0.15,
        value: 0.10,
      },
      priorities: [
        'Camera sensor size and megapixels',
        'Optical image stabilization',
        'Low-light performance',
        'Zoom capabilities',
        'Video recording features',
      ],
    },
    gamer: {
      id: 'gamer',
      name: 'Gamer',
      description: 'Focuses on processing power, GPU performance, and high refresh rate displays',
      icon: 'Gamepad2',
      weights: {
        camera: 0.10,
        performance: 0.45,
        battery: 0.15,
        display: 0.20,
        value: 0.10,
      },
      priorities: [
        'CPU and GPU benchmark scores',
        'High refresh rate display',
        'Thermal management',
        'RAM capacity',
        'Touch response time',
      ],
    },
    battery: {
      id: 'battery',
      name: 'Battery User',
      description: 'Values battery capacity, charging speed, and power efficiency',
      icon: 'Battery',
      weights: {
        camera: 0.10,
        performance: 0.15,
        battery: 0.50,
        display: 0.10,
        value: 0.15,
      },
      priorities: [
        'Battery capacity (mAh)',
        'Fast charging support',
        'Power efficiency of SoC',
        'Screen-on time estimates',
        'Wireless charging availability',
      ],
    },
    value: {
      id: 'value',
      name: 'Budget Buyer',
      description: 'Seeks the best overall value with balanced specs at competitive pricing',
      icon: 'DollarSign',
      weights: {
        camera: 0.20,
        performance: 0.20,
        battery: 0.20,
        display: 0.15,
        value: 0.25,
      },
      priorities: [
        'Price-to-performance ratio',
        'Well-rounded specifications',
        'Build quality',
        'Software update promise',
        'Brand reliability',
      ],
    },
  },
};
