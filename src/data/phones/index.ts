import { Phone } from '../../types';
import { honorPhones } from './honor.data';
import { samsungPhones } from './samsung.data';
import { xiaomiPhones } from './xiaomi.data';

export const allPhones: Phone[] = [
  ...honorPhones,
  ...samsungPhones,
  ...xiaomiPhones,
];

export { honorPhones, samsungPhones, xiaomiPhones };
