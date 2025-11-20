import { Phone, DifferenceHighlight, SignificanceLevel } from '../../types';
import { calculateDelta } from '../../utils';

export function extractDifferences(phone1: Phone, phone2: Phone): DifferenceHighlight[] {
  const differences: DifferenceHighlight[] = [];

  const batteryDiff = calculateDelta(phone1.specs.battery.capacityMah, phone2.specs.battery.capacityMah);
  if (batteryDiff.significance !== 'none') {
    const winner = phone1.specs.battery.capacityMah > phone2.specs.battery.capacityMah ? 'phone1' : 'phone2';
    const winnerPhone = winner === 'phone1' ? phone1 : phone2;
    const loserPhone = winner === 'phone1' ? phone2 : phone1;

    differences.push({
      category: 'battery',
      title: 'Battery Capacity',
      claim: `${winnerPhone.brand} ${winnerPhone.model} has a larger ${batteryDiff.absolute}mAh battery`,
      whyItMatters: `Longer battery life means less frequent charging. The larger battery can provide ${Math.round(batteryDiff.percentage * 100)}% more capacity, translating to several more hours of use.`,
      winner,
      significance: batteryDiff.significance,
      delta: {
        value: batteryDiff.absolute,
        unit: 'mAh',
        percentage: Math.round(batteryDiff.percentage * 100),
      },
      evidence: {
        phone1Value: phone1.specs.battery.capacityMah,
        phone2Value: phone2.specs.battery.capacityMah,
        sourceField: 'specs.battery.capacityMah',
      },
    });
  }

  const chargingP1 = phone1.specs.battery.wiredCharging || 0;
  const chargingP2 = phone2.specs.battery.wiredCharging || 0;
  const chargingDiff = calculateDelta(chargingP1, chargingP2);
  if (chargingDiff.significance !== 'none' && (chargingP1 > 0 || chargingP2 > 0)) {
    const winner = chargingP1 > chargingP2 ? 'phone1' : 'phone2';
    const winnerPhone = winner === 'phone1' ? phone1 : phone2;
    const winnerWattage = winner === 'phone1' ? chargingP1 : chargingP2;

    differences.push({
      category: 'battery',
      title: 'Fast Charging Speed',
      claim: `${winnerPhone.brand} ${winnerPhone.model} supports ${winnerWattage}W fast charging`,
      whyItMatters: `Faster charging means less downtime. With ${winnerWattage}W charging, you can get hours of battery life from just minutes of charging.`,
      winner,
      significance: chargingDiff.significance,
      delta: {
        value: chargingDiff.absolute,
        unit: 'W',
        percentage: Math.round(chargingDiff.percentage * 100),
      },
      evidence: {
        phone1Value: chargingP1,
        phone2Value: chargingP2,
        sourceField: 'specs.battery.wiredCharging',
      },
    });
  }

  if (phone1.specs.cameraScore && phone2.specs.cameraScore) {
    const cameraDiff = calculateDelta(phone1.specs.cameraScore.overall, phone2.specs.cameraScore.overall);
    if (cameraDiff.significance !== 'none') {
      const winner = phone1.specs.cameraScore.overall > phone2.specs.cameraScore.overall ? 'phone1' : 'phone2';
      const winnerPhone = winner === 'phone1' ? phone1 : phone2;
      const winnerScore = winner === 'phone1' ? phone1.specs.cameraScore.overall : phone2.specs.cameraScore.overall;

      differences.push({
        category: 'camera',
        title: 'Overall Camera Quality',
        claim: `${winnerPhone.brand} ${winnerPhone.model} scores ${winnerScore} in camera tests`,
        whyItMatters: `Professional camera testing reveals superior image quality, especially in challenging conditions like low light and high zoom.`,
        winner,
        significance: cameraDiff.significance,
        delta: {
          value: cameraDiff.absolute,
          unit: 'points',
          percentage: Math.round(cameraDiff.percentage * 100),
        },
        evidence: {
          phone1Value: phone1.specs.cameraScore.overall,
          phone2Value: phone2.specs.cameraScore.overall,
          sourceField: 'specs.cameraScore.overall',
        },
      });
    }
  }

  const mpP1 = phone1.specs.camera.main.megapixels;
  const mpP2 = phone2.specs.camera.main.megapixels;
  const mpDiff = calculateDelta(mpP1, mpP2);
  if (mpDiff.significance === 'major') {
    const winner = mpP1 > mpP2 ? 'phone1' : 'phone2';
    const winnerPhone = winner === 'phone1' ? phone1 : phone2;
    const winnerMp = winner === 'phone1' ? mpP1 : mpP2;

    differences.push({
      category: 'camera',
      title: 'Main Camera Resolution',
      claim: `${winnerPhone.brand} ${winnerPhone.model} features a ${winnerMp}MP main camera`,
      whyItMatters: `Higher resolution allows for more detail capture and better digital zoom quality, ideal for cropping and large prints.`,
      winner,
      significance: mpDiff.significance,
      delta: {
        value: mpDiff.absolute,
        unit: 'MP',
        percentage: Math.round(mpDiff.percentage * 100),
      },
      evidence: {
        phone1Value: mpP1,
        phone2Value: mpP2,
        sourceField: 'specs.camera.main.megapixels',
      },
    });
  }

  if (phone1.benchmarks?.antutu && phone2.benchmarks?.antutu) {
    const antutuP1 = phone1.benchmarks.antutu.total.median;
    const antutuP2 = phone2.benchmarks.antutu.total.median;
    const antutuDiff = calculateDelta(antutuP1, antutuP2);

    if (antutuDiff.significance !== 'none') {
      const winner = antutuP1 > antutuP2 ? 'phone1' : 'phone2';
      const winnerPhone = winner === 'phone1' ? phone1 : phone2;
      const winnerScore = winner === 'phone1' ? antutuP1 : antutuP2;

      differences.push({
        category: 'performance',
        title: 'Overall Performance',
        claim: `${winnerPhone.brand} ${winnerPhone.model} scores ${Math.round(winnerScore / 1000)}k in AnTuTu`,
        whyItMatters: `Higher benchmark scores mean smoother multitasking, faster app launches, and better gaming performance with higher frame rates.`,
        winner,
        significance: antutuDiff.significance,
        delta: {
          value: Math.round(antutuDiff.absolute),
          unit: 'points',
          percentage: Math.round(antutuDiff.percentage * 100),
        },
        evidence: {
          phone1Value: antutuP1,
          phone2Value: antutuP2,
          sourceField: 'benchmarks.antutu.total.median',
        },
      });
    }
  }

  const displayP1 = phone1.specs.display.peakBrightness || 1000;
  const displayP2 = phone2.specs.display.peakBrightness || 1000;
  const displayDiff = calculateDelta(displayP1, displayP2);
  if (displayDiff.significance !== 'none') {
    const winner = displayP1 > displayP2 ? 'phone1' : 'phone2';
    const winnerPhone = winner === 'phone1' ? phone1 : phone2;
    const winnerBrightness = winner === 'phone1' ? displayP1 : displayP2;

    differences.push({
      category: 'display',
      title: 'Peak Brightness',
      claim: `${winnerPhone.brand} ${winnerPhone.model} reaches ${winnerBrightness} nits peak brightness`,
      whyItMatters: `Brighter displays are crucial for outdoor visibility in direct sunlight, making your screen readable even on the brightest days.`,
      winner,
      significance: displayDiff.significance,
      delta: {
        value: displayDiff.absolute,
        unit: 'nits',
        percentage: Math.round(displayDiff.percentage * 100),
      },
      evidence: {
        phone1Value: displayP1,
        phone2Value: displayP2,
        sourceField: 'specs.display.peakBrightness',
      },
    });
  }

  differences.sort((a, b) => {
    const sigOrder: Record<SignificanceLevel, number> = { major: 3, notable: 2, minor: 1, none: 0 };
    return sigOrder[b.significance] - sigOrder[a.significance];
  });

  return differences.slice(0, 6);
}
