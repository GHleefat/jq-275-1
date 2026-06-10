import { useState, useEffect, useRef, useCallback } from 'react';

const DIAL_CONFIG = {
  size: 380,
  numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  minAngle: 30,
  maxAngle: 300,
  stopAngle: 330,
  springBackDuration: 600,
  minDigitsToAutoCall: 5,
  autoCallDelay: 2500,
};

const FUN_NUMBERS: Record<string, { name: string; message: string }> = {
  '12345': { name: '天气预报', message: '今天晴天，气温23度，适合外出！' },
  '119': { name: '消防热线', message: '这是模拟电话，遇到紧急情况请拨打真实号码！' },
  '110': { name: '报警电话', message: '这是模拟电话，遇到紧急情况请拨打真实号码！' },
  '5201314': { name: '爱心热线', message: '嘟嘟嘟~ 爱心已送达！我爱你！' },
  '88888': { name: '发财热线', message: '恭喜发财！好运连连！' },
  '10086': { name: '客服热线', message: '您好，这里是模拟客服，请问有什么可以帮您？' },
};

export default function Home() {
  const [dialedNumber, setDialedNumber] = useState('');
  const [isRotating, setIsRotating] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [isCalling, setIsCalling] = useState(false);
  const [callResult, setCallResult] = useState<{ type: 'connect' | 'busy' | 'fun'; message: string; name?: string } | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const dialingRef = useRef(false);
  const autoCallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const clearAutoCallTimer = useCallback(() => {
    if (autoCallTimerRef.current) {
      clearTimeout(autoCallTimerRef.current);
      autoCallTimerRef.current = null;
    }
  }, []);

  const shouldAutoCall = useCallback((number: string) => {
    if (number.length === 0) return false;
    if (FUN_NUMBERS[number]) return true;
    if (number.length >= DIAL_CONFIG.minDigitsToAutoCall) return true;
    return false;
  }, []);

  const playClick = useCallback(() => {
    const ctx = initAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.03);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.03);
  }, [initAudioContext]);

  const playPulseDial = useCallback((digit: number) => {
    const ctx = initAudioContext();
    const pulses = digit === 0 ? 10 : digit;
    const pulseDuration = 0.06;
    const gapDuration = 0.06;
    
    for (let i = 0; i < pulses; i++) {
      const startTime = ctx.currentTime + i * (pulseDuration + gapDuration);
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(35, startTime);
      
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + pulseDuration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + pulseDuration);
    }
  }, [initAudioContext]);

  const playDialTone = useCallback(() => {
    const ctx = initAudioContext();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(440, now);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(480, now);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.setValueAtTime(0.15, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  }, [initAudioContext]);

  const playRingTone = useCallback(() => {
    const ctx = initAudioContext();
    const now = ctx.currentTime;
    
    for (let i = 0; i < 3; i++) {
      const startTime = now + i * 1.2;
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, startTime);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(480, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
      gain.gain.setValueAtTime(0.15, startTime + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + 0.4);
      osc2.stop(startTime + 0.4);
    }
  }, [initAudioContext]);

  const playBusyTone = useCallback(() => {
    const ctx = initAudioContext();
    const now = ctx.currentTime;
    
    for (let i = 0; i < 6; i++) {
      const startTime = now + i * 0.5;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
      gain.gain.setValueAtTime(0.2, startTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.25);
    }
  }, [initAudioContext]);

  const getNumberAngle = useCallback((numStr: string) => {
    const num = parseInt(numStr);
    if (num === 0) return 280;
    return 20 + (num - 1) * 28;
  }, []);

  const handleDial = useCallback((numStr: string) => {
    if (isRotating || isCalling) return;
    if (dialedNumber.length >= 11) return;

    clearAutoCallTimer();
    initAudioContext();
    setIsRotating(true);
    dialingRef.current = true;

    const numberAngle = getNumberAngle(numStr);
    const finalAngle = DIAL_CONFIG.stopAngle - numberAngle;

    let currentAngle = 0;
    const rotateDuration = 500;
    const startTime = performance.now();
    const digit = parseInt(numStr);
    const totalPulses = digit === 0 ? 10 : digit;

    let lastPulseIndex = -1;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / rotateDuration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      currentAngle = easeProgress * finalAngle;

      const pulseIndex = Math.floor((currentAngle / finalAngle) * totalPulses);
      if (pulseIndex > lastPulseIndex && pulseIndex <= totalPulses) {
        playClick();
        lastPulseIndex = pulseIndex;
      }

      setCurrentRotation(currentAngle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          playPulseDial(digit);
          
          const springStart = performance.now();
          const springBack = (springNow: number) => {
            const springElapsed = springNow - springStart;
            const springProgress = Math.min(springElapsed / DIAL_CONFIG.springBackDuration, 1);
            const easeOut = 1 - Math.pow(1 - springProgress, 4);
            const angle = finalAngle * (1 - easeOut);
            
            setCurrentRotation(angle);

            if (springProgress < 1) {
              requestAnimationFrame(springBack);
            } else {
              setCurrentRotation(0);
              setIsRotating(false);
              dialingRef.current = false;
              setDialedNumber(prev => prev + numStr);
            }
          };
          requestAnimationFrame(springBack);
        }, 100);
      }
    };
    requestAnimationFrame(animate);
  }, [isRotating, isCalling, dialedNumber, initAudioContext, getNumberAngle, playClick, playPulseDial, clearAutoCallTimer]);

  const makeCall = useCallback(() => {
    if (dialedNumber.length === 0 || isCalling) return;

    clearAutoCallTimer();
    setIsCalling(true);
    setShowMessage(false);
    playDialTone();

    setTimeout(() => {
      const funEntry = FUN_NUMBERS[dialedNumber];

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
  }, [dialedNumber, isCalling, playDialTone, playRingTone, playBusyTone, clearAutoCallTimer]);

  useEffect(() => {
    clearAutoCallTimer();

    if (showMessage || isCalling || isRotating) {
      return;
    }

    if (dialedNumber.length > 0 && shouldAutoCall(dialedNumber)) {
      autoCallTimerRef.current = setTimeout(() => {
        if (!dialingRef.current && !isCalling && !isRotating) {
          makeCall();
        }
      }, DIAL_CONFIG.autoCallDelay);
    }

    return () => clearAutoCallTimer();
  }, [dialedNumber, isCalling, isRotating, showMessage, shouldAutoCall, makeCall, clearAutoCallTimer]);

  const clearNumber = useCallback(() => {
    clearAutoCallTimer();
    setDialedNumber('');
    setCallResult(null);
    setShowMessage(false);
  }, [clearAutoCallTimer]);

  const dialCenter = DIAL_CONFIG.size / 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 flex flex-col items-center justify-center p-4 select-none">
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
          ☎ 老式转盘电话 ☎
        </h1>
        <p className="text-amber-700 text-sm">点击数字拨号，体验爸爸妈妈小时候的电话</p>
      </div>

      <div className="bg-gradient-to-b from-amber-800 to-amber-900 rounded-[40px] p-8 shadow-2xl border-4 border-amber-950">
        <div className="bg-gradient-to-b from-black via-gray-900 to-black rounded-xl p-4 mb-6 border-4 border-gray-700 shadow-inner">
          <div className="bg-green-950 rounded-lg p-4 min-h-[70px] flex items-center justify-center">
            {isCalling ? (
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-2xl font-mono animate-pulse">正在呼叫</span>
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            ) : showMessage && callResult ? (
              <div className="text-center">
                {callResult.type === 'fun' && callResult.name && (
                  <div className="text-yellow-400 text-xs mb-1">★ {callResult.name} ★</div>
                )}
                <div className={`text-xl font-mono ${
                  callResult.type === 'busy' ? 'text-red-400' :
                  callResult.type === 'fun' ? 'text-yellow-300' : 'text-green-400'
                }`}>
                  {callResult.message}
                </div>
              </div>
            ) : (
              <div className="text-green-400 text-3xl font-mono tracking-wider">
                {dialedNumber || <span className="text-green-700">等待拨号...</span>}
                <span className="animate-pulse text-green-300">_</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div 
            className="relative"
            style={{ 
              width: DIAL_CONFIG.size, 
              height: DIAL_CONFIG.size,
            }}
          >
            <div 
              className="absolute inset-0 rounded-full shadow-[inset_0_8px_16px_rgba(0,0,0,0.4)]"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #fef3c7 0%, #fde68a 30%, #fbbf24 60%, #d97706 100%)',
              }}
            />

            <div
              className="absolute rounded-full transition-none"
              style={{
                width: DIAL_CONFIG.size - 20,
                height: DIAL_CONFIG.size - 20,
                top: 10,
                left: 10,
                background: 'radial-gradient(circle at 35% 35%, #fef9c3, #fef08a, #facc15, #eab308)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 -4px 8px rgba(0,0,0,0.1)',
                transform: `rotate(${currentRotation}deg)`,
                transformOrigin: 'center center',
              }}
            >
              {DIAL_CONFIG.numbers.map((num, index) => {
                let angle: number;
                if (num === '0') {
                  angle = 280;
                } else {
                  angle = 20 + (index) * 28;
                }
                const radius = (DIAL_CONFIG.size - 20) / 2 - 42;
                const radian = (angle - 90) * (Math.PI / 180);
                const x = Math.cos(radian) * radius;
                const y = Math.sin(radian) * radius;

                return (
                  <button
                    key={num}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDial(num);
                    }}
                    disabled={isRotating || isCalling}
                    className="absolute flex items-center justify-center rounded-full font-bold text-xl cursor-pointer transition-transform active:scale-95 disabled:cursor-not-allowed"
                    style={{
                      width: 52,
                      height: 52,
                      left: `calc(50% + ${x}px - 26px)`,
                      top: `calc(50% + ${y}px - 26px)`,
                      background: 'radial-gradient(circle at 30% 30%, #ffffff, #f5f5f4, #d6d3d1, #a8a29e)',
                      boxShadow: '0 3px 6px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.8)',
                      color: '#1c1917',
                      border: '2px solid #78716c',
                    }}
                  >
                    {num}
                  </button>
                );
              })}

              <div
                className="absolute rounded-full"
                style={{
                  width: 130,
                  height: 130,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle at 35% 35%, #fde68a, #f59e0b, #b45309)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 2px 6px rgba(255,255,255,0.3)',
                  border: '4px solid #92400e',
                }}
              />
            </div>

            <div
              className="absolute"
              style={{
                width: 24,
                height: 44,
                left: '50%',
                top: 8,
                transform: 'translateX(-50%)',
                background: 'linear-gradient(180deg, #44403c, #1c1917)',
                borderRadius: '6px 6px 14px 14px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.2)',
                zIndex: 10,
              }}
            />
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={clearNumber}
            className="px-6 py-3 bg-gradient-to-b from-red-500 to-red-700 text-white rounded-xl font-bold shadow-lg hover:from-red-600 hover:to-red-800 active:scale-95 transition-all border-2 border-red-800"
          >
            🗑 清除
          </button>
          <button
            onClick={makeCall}
            disabled={dialedNumber.length === 0 || isCalling}
            className="px-6 py-3 bg-gradient-to-b from-green-500 to-green-700 text-white rounded-xl font-bold shadow-lg hover:from-green-600 hover:to-green-800 active:scale-95 transition-all border-2 border-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📞 拨打
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white/60 backdrop-blur rounded-xl p-4 max-w-md shadow-lg border border-amber-200">
        <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
          <span>✨</span> 趣味号码
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(FUN_NUMBERS).map(([num, info]) => (
            <button
              key={num}
              onClick={() => {
                clearNumber();
                setTimeout(() => {
                  setDialedNumber(num);
                }, 50);
              }}
              className="text-left px-3 py-2 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
            >
              <span className="font-mono text-amber-800 font-bold">{num}</span>
              <span className="text-amber-600 ml-2">{info.name}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-amber-700 text-xs text-center">
        💡 提示：拨满 {DIAL_CONFIG.minDigitsToAutoCall} 位或拨中趣味号码，等待2秒会自动呼叫哦！
      </p>
    </div>
  );
}
