import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DIAL_CONFIG,
  CallResult,
  shouldAutoCall,
  canMakeCall,
  getFunNumber,
} from '../lib/phoneConfig';
import {
  initAudioContext,
  playDialTone,
  playRingTone,
  playBusyTone,
} from '../lib/phoneAudio';

export function usePhone() {
  const [dialedNumber, setDialedNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callResult, setCallResult] = useState<CallResult | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  const autoCallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoCallTimer = useCallback(() => {
    if (autoCallTimerRef.current) {
      clearTimeout(autoCallTimerRef.current);
      autoCallTimerRef.current = null;
    }
  }, []);

  const appendDigit = useCallback((digit: string) => {
    clearAutoCallTimer();
    setDialedNumber((prev) => prev + digit);
  }, [clearAutoCallTimer]);

  const makeCall = useCallback(() => {
    if (!canMakeCall(dialedNumber) || isCalling) return;

    clearAutoCallTimer();
    initAudioContext();
    setIsCalling(true);
    setShowMessage(false);
    playDialTone();

    setTimeout(() => {
      const funEntry = getFunNumber(dialedNumber);

      if (funEntry) {
        playRingTone();
        setTimeout(() => {
          setCallResult({ type: 'fun', message: funEntry.message, name: funEntry.name });
          setShowMessage(true);
          setIsCalling(false);
        }, 2000);
      } else {
        const isConnected = Math.random() > 0.4;
        if (isConnected) {
          playRingTone();
          setTimeout(() => {
            setCallResult({ type: 'connect', message: '喂？您好！请问找谁？' });
            setShowMessage(true);
            setIsCalling(false);
          }, 2000);
        } else {
          setTimeout(() => {
            playBusyTone();
            setCallResult({ type: 'busy', message: '嘟嘟嘟... 线路正忙，请稍后再拨' });
            setShowMessage(true);
            setIsCalling(false);
          }, 1000);
        }
      }
    }, 600);
  }, [dialedNumber, isCalling, clearAutoCallTimer]);

  const clearNumber = useCallback(() => {
    clearAutoCallTimer();
    setDialedNumber('');
    setCallResult(null);
    setShowMessage(false);
  }, [clearAutoCallTimer]);

  useEffect(() => {
    clearAutoCallTimer();

    if (showMessage || isCalling) {
      return;
    }

    if (dialedNumber.length > 0 && shouldAutoCall(dialedNumber)) {
      autoCallTimerRef.current = setTimeout(() => {
        makeCall();
      }, DIAL_CONFIG.autoCallDelay);
    }

    return () => clearAutoCallTimer();
  }, [dialedNumber, isCalling, showMessage, makeCall, clearAutoCallTimer]);

  const canDial = canMakeCall(dialedNumber);

  return {
    dialedNumber,
    isCalling,
    callResult,
    showMessage,
    canDial,
    appendDigit,
    makeCall,
    clearNumber,
  };
}
