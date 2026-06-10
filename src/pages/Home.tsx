import { useCallback } from 'react';
import { usePhone } from '../hooks/usePhone';
import { useRotaryDial } from '../hooks/useRotaryDial';
import { DIAL_CONFIG, FUN_NUMBERS, getNumberPosition } from '../lib/phoneConfig';
import { initAudioContext } from '../lib/phoneAudio';

export default function Home() {
  const {
    dialedNumber,
    isCalling,
    callResult,
    showMessage,
    canDial,
    appendDigit,
    makeCall,
    clearNumber,
  } = usePhone();

  const handleDialComplete = useCallback(
    (digit: string) => {
      initAudioContext();
      appendDigit(digit);
    },
    [appendDigit],
  );

  const { isRotating, currentRotation, handleDial } = useRotaryDial(
    handleDialComplete,
    isCalling,
    dialedNumber.length,
  );

  const dialQuickNumber = useCallback(
    (num: string) => {
      clearNumber();
      setTimeout(() => {
        for (let i = 0; i < num.length; i++) {
          const digit = num[i];
          setTimeout(() => {
            appendDigit(digit);
          }, i * 50);
        }
      }, 50);
    },
    [clearNumber, appendDigit],
  );

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
              {DIAL_CONFIG.numbers.map((num) => {
                const { x, y } = getNumberPosition(num, DIAL_CONFIG.size);

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
            disabled={!canDial || isCalling}
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
              onClick={() => dialQuickNumber(num)}
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
