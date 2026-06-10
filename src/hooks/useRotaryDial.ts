import { useState, useRef, useCallback } from 'react';
import { DIAL_CONFIG, getNumberAngle } from '../lib/phoneConfig';
import { playClick, playPulseDial } from '../lib/phoneAudio';

type DialState = {
  isRotating: boolean;
  currentRotation: number;
};

export function useRotaryDial(
  onDialComplete: (digit: string) => void,
  isCalling: boolean,
  currentNumberLength: number,
) {
  const [dialState, setDialState] = useState<DialState>({
    isRotating: false,
    currentRotation: 0,
  });
  const dialingRef = useRef(false);

  const handleDial = useCallback(
    (numStr: string) => {
      if (dialState.isRotating || isCalling) return;
      if (currentNumberLength >= DIAL_CONFIG.maxDigits) return;

      const numberAngle = getNumberAngle(numStr);
      const finalAngle = DIAL_CONFIG.stopAngle - numberAngle;
      const digit = parseInt(numStr, 10);
      const totalPulses = digit === 0 ? 10 : digit;

      let currentAngle = 0;
      let lastPulseIndex = -1;
      const startTime = performance.now();

      dialingRef.current = true;
      setDialState({ isRotating: true, currentRotation: 0 });

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / DIAL_CONFIG.rotateDuration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        currentAngle = easeProgress * finalAngle;

        const pulseIndex = Math.floor((currentAngle / finalAngle) * totalPulses);
        if (pulseIndex > lastPulseIndex && pulseIndex <= totalPulses) {
          playClick();
          lastPulseIndex = pulseIndex;
        }

        setDialState((prev) => ({ ...prev, currentRotation: currentAngle }));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setTimeout(() => {
            playPulseDial(digit);

            const springStart = performance.now();
            const springBack = (springNow: number) => {
              const springElapsed = springNow - springStart;
              const springProgress = Math.min(
                springElapsed / DIAL_CONFIG.springBackDuration,
                1,
              );
              const easeOut = 1 - Math.pow(1 - springProgress, 4);
              const angle = finalAngle * (1 - easeOut);

              setDialState((prev) => ({ ...prev, currentRotation: angle }));

              if (springProgress < 1) {
                requestAnimationFrame(springBack);
              } else {
                setDialState({ isRotating: false, currentRotation: 0 });
                dialingRef.current = false;
                onDialComplete(numStr);
              }
            };
            requestAnimationFrame(springBack);
          }, 100);
        }
      };
      requestAnimationFrame(animate);
    },
    [dialState.isRotating, isCalling, currentNumberLength, onDialComplete],
  );

  return {
    ...dialState,
    handleDial,
    dialingRef,
  };
}
