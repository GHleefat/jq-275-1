export const DIAL_CONFIG = {
  size: 380,
  numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  minAngle: 30,
  maxAngle: 300,
  stopAngle: 330,
  springBackDuration: 600,
  minDigitsToAutoCall: 5,
  autoCallDelay: 2500,
  maxDigits: 11,
  rotateDuration: 500,
} as const;

export type FunNumberInfo = {
  name: string;
  message: string;
};

export const FUN_NUMBERS: Record<string, FunNumberInfo> = {
  '12345': { name: '天气预报', message: '今天晴天，气温23度，适合外出！' },
  '119': { name: '消防热线', message: '这是模拟电话，遇到紧急情况请拨打真实号码！' },
  '110': { name: '报警电话', message: '这是模拟电话，遇到紧急情况请拨打真实号码！' },
  '5201314': { name: '爱心热线', message: '嘟嘟嘟~ 爱心已送达！我爱你！' },
  '88888': { name: '发财热线', message: '恭喜发财！好运连连！' },
  '10086': { name: '客服热线', message: '您好，这里是模拟客服，请问有什么可以帮您？' },
};

export type CallResultType = 'connect' | 'busy' | 'fun';

export type CallResult = {
  type: CallResultType;
  message: string;
  name?: string;
};

export function getNumberAngle(numStr: string): number {
  const num = parseInt(numStr, 10);
  if (num === 0) return 280;
  return 20 + (num - 1) * 28;
}

export function isFunNumber(number: string): boolean {
  return Object.prototype.hasOwnProperty.call(FUN_NUMBERS, number);
}

export function getFunNumber(number: string): FunNumberInfo | undefined {
  return FUN_NUMBERS[number];
}

export function shouldAutoCall(number: string): boolean {
  if (number.length === 0) return false;
  if (isFunNumber(number)) return true;
  if (number.length >= DIAL_CONFIG.minDigitsToAutoCall) return true;
  return false;
}

export function canMakeCall(number: string): boolean {
  if (number.length === 0) return false;
  if (isFunNumber(number)) return true;
  if (number.length >= DIAL_CONFIG.minDigitsToAutoCall) return true;
  return false;
}

export function getNumberPosition(num: string, dialSize: number): { x: number; y: number; angle: number } {
  const angle = getNumberAngle(num);
  const radius = (dialSize - 20) / 2 - 42;
  const radian = (angle - 90) * (Math.PI / 180);
  const x = Math.cos(radian) * radius;
  const y = Math.sin(radian) * radius;
  return { x, y, angle };
}
