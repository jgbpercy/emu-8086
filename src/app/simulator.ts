import { DecodedInstruction, EffectiveAddressCalculation, RegisterOrEac } from './decoder';
import { KeyOfType } from './key-of-type';
import { Memory, ReadonlyMemory, total8086MemorySizeInBytes } from './memory';
import {
  Register,
  SegmentRegister,
  WordRegisterName,
  axReg,
  isHigh8BitRegister,
  isWordRegister,
  mainRegisterTable,
} from './register-data';

interface _SimulationStatePrimatives {
  ax: number;
  bx: number;
  cx: number;
  dx: number;

  sp: number;
  bp: number;
  si: number;
  di: number;

  cs: number;
  ds: number;
  es: number;
  ss: number;

  ip: number;

  trapFlag: boolean;
  directionFlag: boolean;
  interruptFlag: boolean;
  overflowFlag: boolean;
  signFlag: boolean;
  zeroFlag: boolean;
  auxCarryFlag: boolean;
  parityFlag: boolean;
  carryFlag: boolean;
}

export type SimulationState = _SimulationStatePrimatives & {
  readonly memory: Memory;
};

export type ReadonlySimulationState = Readonly<_SimulationStatePrimatives> & {
  readonly memory: ReadonlyMemory;
};

export interface GenericSimulationStatePropertyDiff<T> {
  readonly key: KeyOfType<SimulationState, T>;
  readonly from: T;
  readonly to: T;
}

export interface MemoryDiff {
  readonly address: number;
  readonly from: number;
  readonly to: number;
}

export type SimulationStatePropertyDiff =
  | GenericSimulationStatePropertyDiff<number>
  | GenericSimulationStatePropertyDiff<boolean>
  | MemoryDiff;

export type SimulationStateDiff = ReadonlyArray<SimulationStatePropertyDiff>;

export function simulateInstruction(
  state: SimulationState,
  instruction: DecodedInstruction,
): SimulationStateDiff {
  const diff = simulateInstructionDiff(state, instruction);

  applyDiff(state, diff);

  return diff;
}

function simulateInstructionDiff(
  state: ReadonlySimulationState,
  instruction: DecodedInstruction,
): Readonly<SimulationStateDiff> {
  switch (instruction.kind) {
    case 'addRegisterMemoryWithRegisterToEither': {
      const regOperand = getRegisterOperand(instruction);

      const word = isWordRegister(regOperand);

      const sourceValue = getRegisterOrEacValue(state, instruction.op2, word, 'ds');

      return makeAddDiffs(state, instruction.op1, sourceValue, word, instruction.byteLength);
    }

    case 'addImmediateToAccumulator':
      return makeAddDiffs(
        state,
        instruction.op1,
        instruction.op2,
        isWordRegister(instruction.op1),
        instruction.byteLength,
      );

    case 'pushSegmentRegister': {
      const newSp = state.sp - 2;

      const stackAddress = getMemoryAddress(state, newSp, 'ss');

      return [
        makeNextInstructionDiff(state, instruction.byteLength),
        { key: 'sp', from: state.sp, to: newSp },
        ...makeSetMemoryValueDiffs(state, stackAddress, state[instruction.op1], true),
      ];
    }

    case 'popSegmentRegister': {
      const stackAddress = getMemoryAddress(state, state.sp, 'ss');

      const value = state.memory.readWord(stackAddress);

      return [
        makeNextInstructionDiff(state, instruction.byteLength),
        { key: 'sp', from: state.sp, to: state.sp + 2 },
        { key: instruction.op1, from: state[instruction.op1], to: value },
      ];
    }

    case 'orRegisterMemoryAndRegisterToEither': {
      const regOperand = getRegisterOperand(instruction);

      const word = isWordRegister(regOperand);

      const sourceValue = getRegisterOrEacValue(state, instruction.op2, word, 'ds');

      return makeOrDiffs(state, instruction.op1, sourceValue, word, instruction.byteLength);
    }

    case 'orImmediateToAccumulator':
      return makeOrDiffs(
        state,
        instruction.op1,
        instruction.op2,
        isWordRegister(instruction.op1),
        instruction.byteLength,
      );

    case 'adcRegisterMemoryWithRegisterToEither': {
      const regOperand = getRegisterOperand(instruction);

      const word = isWordRegister(regOperand);

      const carry = state.carryFlag ? 1 : 0;

      const sourceValueWithCarry =
        getRegisterOrEacValue(state, instruction.op2, word, 'ds') + carry;

      return makeAddDiffs(
        state,
        instruction.op1,
        sourceValueWithCarry,
        word,
        instruction.byteLength,
      );
    }

    case 'adcImmediateToAccumulator':
      return makeAddDiffs(
        state,
        instruction.op1,
        instruction.op2 + (state.carryFlag ? 1 : 0),
        isWordRegister(instruction.op1),
        instruction.byteLength,
      );

    case 'sbbRegisterMemoryAndRegisterToEither': {
      const regOperand = getRegisterOperand(instruction);

      const word = isWordRegister(regOperand);

      const carry = state.carryFlag ? 1 : 0;

      const sourceValueWithCarry =
        getRegisterOrEacValue(state, instruction.op2, word, 'ds') - carry;

      return makeSubDiffs(
        state,
        instruction.op1,
        sourceValueWithCarry,
        word,
        instruction.byteLength,
      );
    }

    case 'sbbImmediateFromAccumulator':
      return makeSubDiffs(
        state,
        instruction.op1,
        instruction.op2 - (state.carryFlag ? 1 : 0),
        isWordRegister(instruction.op1),
        instruction.byteLength,
      );

    case 'andRegisterMemoryWithRegisterToEither': {
      const regOperand = getRegisterOperand(instruction);

      const word = isWordRegister(regOperand);

      const sourceValue = getRegisterOrEacValue(state, instruction.op2, word, 'ds');

      return makeAndDiffs(state, instruction.op1, sourceValue, word, instruction.byteLength);
    }

    case 'andImmediateToAccumulator':
      return makeAndDiffs(
        state,
        instruction.op1,
        instruction.op2,
        isWordRegister(instruction.op1),
        instruction.byteLength,
      );

    case 'subRegisterMemoryAndRegisterToEither': {
      const regOperand = getRegisterOperand(instruction);

      const word = isWordRegister(regOperand);

      const sourceValue = getRegisterOrEacValue(state, instruction.op2, word, 'ds');

      return makeSubDiffs(state, instruction.op1, sourceValue, word, instruction.byteLength);
    }

    // https://www.righto.com/2023/01/understanding-x86s-decimal-adjust-after.html
    case 'daaDecimalAdjustForAdd': {
      const alLowNibble = state.ax && 0x000f;

      let alResult = state.ax & 0x00ff;
      let setAuxCarry = false;
      let setCarry = false;

      if (alLowNibble >= 10 || state.auxCarryFlag) {
        alResult += 6;
        setAuxCarry = true;
      }

      if (alResult > 0x99 || state.carryFlag) {
        alResult += 0x60;
        setCarry = true;
      }

      const result = (state.ax & 0xff00) + alResult;

      return [
        makeNextInstructionDiff(state, instruction.byteLength),
        makeSetRegisterValueDiff(state, axReg, result),
        makeSetSignFlagDiff(state, result, false),
        makeSetZeroFlagDiff(state, result),
        makeSetFlagDiff(state, 'auxCarryFlag', setAuxCarry),
        makeSetParityFlagDiff(state, result),
        makeSetFlagDiff(state, 'carryFlag', setCarry),
      ];
    }

    case 'subImmediateFromAccumulator':
      return makeSubDiffs(
        state,
        instruction.op1,
        instruction.op2,
        isWordRegister(instruction.op1),
        instruction.byteLength,
      );

    case 'cmpRegisterMemoryAndRegister': {
      const regOperand = getRegisterOperand(instruction);

      const word = isWordRegister(regOperand);

      const sourceValue = getRegisterOrEacValue(state, instruction.op2, word, 'ds');

      return makeCmpDiffs(state, instruction.op1, sourceValue, word, instruction.byteLength);
    }

    case 'cmpImmediateWithAccumulator':
      return makeCmpDiffs(
        state,
        instruction.op1,
        instruction.op2,
        isWordRegister(instruction.op1),
        instruction.byteLength,
      );

    case 'joJumpOnOverflow':
      return makeShortLabelJumpDiff(state, instruction, state.overflowFlag);

    case 'jnoJumpOnNotOverflow':
      return makeShortLabelJumpDiff(state, instruction, !state.overflowFlag);

    case 'jbJumpOnBelow':
      return makeShortLabelJumpDiff(state, instruction, state.carryFlag);

    case 'jnbJumpOnNotBelow':
      return makeShortLabelJumpDiff(state, instruction, !state.carryFlag);

    case 'jeJumpOnEqual':
      return makeShortLabelJumpDiff(state, instruction, state.zeroFlag);

    case 'jneJumpOnNotEqual':
      return makeShortLabelJumpDiff(state, instruction, !state.zeroFlag);

    case 'jnaJumpOnNotAbove':
      return makeShortLabelJumpDiff(state, instruction, state.carryFlag || state.overflowFlag);

    case 'jaJumpOnAbove':
      return makeShortLabelJumpDiff(state, instruction, !(state.carryFlag || state.overflowFlag));

    case 'jsJumpOnSign':
      return makeShortLabelJumpDiff(state, instruction, state.signFlag);

    case 'jnsJumpOnNotSign':
      return makeShortLabelJumpDiff(state, instruction, !state.signFlag);

    case 'jpJumpOnParity':
      return makeShortLabelJumpDiff(state, instruction, state.parityFlag);

    case 'jnpJumpOnNotParity':
      return makeShortLabelJumpDiff(state, instruction, !state.parityFlag);

    case 'jlJumpOnLess':
      return makeShortLabelJumpDiff(
        state,
        instruction,
        // XOR, technially
        state.signFlag !== state.overflowFlag,
      );

    case 'jnlJumpOnNotLess':
      return makeShortLabelJumpDiff(
        state,
        instruction,
        // !XOR
        state.signFlag === state.overflowFlag,
      );

    case 'jngJumpOnNotGreater':
      return makeShortLabelJumpDiff(
        state,
        instruction,
        state.overflowFlag !== state.signFlag || state.zeroFlag,
      );

    case 'jgJumpOnGreater':
      return makeShortLabelJumpDiff(
        state,
        instruction,
        !(state.overflowFlag !== state.signFlag || state.zeroFlag),
      );

    case 'addImmediateToRegisterMemory': {
      const dest = instruction.op1;

      return makeAddDiffs(
        state,
        dest,
        sanitize8BitSignExtendedNegatives(instruction.op2),
        dest.kind === 'reg' ? isWordRegister(dest) : dest.length === 2,
        instruction.byteLength,
      );
    }

    case 'subImmediateToRegisterMemory': {
      const dest = instruction.op1;

      return makeSubDiffs(
        state,
        dest,
        sanitize8BitSignExtendedNegatives(instruction.op2),
        dest.kind === 'reg' ? isWordRegister(dest) : dest.length === 2,
        instruction.byteLength,
      );
    }

    case 'cmpImmediateToRegisterMemory': {
      const dest = instruction.op1;

      return makeCmpDiffs(
        state,
        dest,
        sanitize8BitSignExtendedNegatives(instruction.op2),
        dest.kind === 'reg' ? isWordRegister(dest) : dest.length === 2,
        instruction.byteLength,
      );
    }

    case 'movRegisterMemoryToFromRegister': {
      const regOperand = getRegisterOperand(instruction);

      const word = isWordRegister(regOperand);

      const sourceValue = getRegisterOrEacValue(state, instruction.op2, word, 'ds');

      const dest = instruction.op1;

      return [
        makeNextInstructionDiff(state, instruction.byteLength),
        ...makeSetValueDiffs(state, dest, sourceValue, word, 'ds'),
      ];
    }

    case 'movSegmentRegisterToRegisterMemory': {
      const dest = instruction.op1;

      const sourceValue = state[instruction.op2];

      return [
        makeNextInstructionDiff(state, instruction.byteLength),
        ...makeSetValueDiffs(state, dest, sourceValue, true, 'ds'),
      ];
    }

    case 'movRegisterMemoryToSegmentRegister': {
      const source = instruction.op2;

      const sourceValue = getRegisterOrEacValue(state, source, true, 'ds');

      return [
        makeNextInstructionDiff(state, instruction.byteLength),
        makeSetNumberDiff(state, instruction.op1, sourceValue),
      ];
    }

    case 'movImmediateToRegister':
      return [
        makeNextInstructionDiff(state, instruction.byteLength),
        makeSetRegisterValueDiff(state, instruction.op1, instruction.op2),
      ];

    case 'movImmediateToRegisterMemory': {
      const dest = instruction.op1;

      return [
        makeNextInstructionDiff(state, instruction.byteLength),
        ...makeSetValueDiffs(
          state,
          dest,
          instruction.op2,
          instruction.op1.kind === 'mem' && instruction.op1.length === 2,
          'ds',
        ),
      ];
    }

    case 'loopneLoopWhileNotEqual':
      return makeLoopDiff(state, instruction, state.cx - 1 !== 0 && !state.zeroFlag);

    case 'loopeLoopWhileEqual':
      return makeLoopDiff(state, instruction, state.cx - 1 !== 0 && state.zeroFlag);

    case 'loopLoopCxTimes':
      return makeLoopDiff(state, instruction, state.cx - 1 !== 0);

    case 'jcxzJumpOnCxZero':
      return state.cx === 0
        ? [makeSetNumberDiff(state, 'ip', state.ip + instruction.byteLength + instruction.op1)]
        : [makeNextInstructionDiff(state, instruction.byteLength)];

    default:
      return [];
  }
}

function getRegisterOperand(instruction: {
  readonly op1: RegisterOrEac;
  readonly op2: RegisterOrEac;
}): Register {
  const regOperand = instruction.op1.kind === 'reg' ? instruction.op1 : instruction.op2;

  if (regOperand.kind !== 'reg') {
    throw Error('Internal Error - Two memory operands?');
  }

  return regOperand;
}

function makeLoopDiff(
  state: ReadonlySimulationState,
  instruction: { op1: number; byteLength: number },
  condition: boolean,
): SimulationStateDiff {
  return [
    condition
      ? makeSetNumberDiff(state, 'ip', state.ip + instruction.byteLength + instruction.op1)
      : makeNextInstructionDiff(state, instruction.byteLength),
    makeSetNumberDiff(state, 'cx', state.cx - 1),
  ];
}

function makeShortLabelJumpDiff(
  state: ReadonlySimulationState,
  instruction: { op1: number; byteLength: number },
  condition: boolean,
): SimulationStateDiff {
  return condition
    ? [makeSetNumberDiff(state, 'ip', state.ip + instruction.byteLength + instruction.op1)]
    : [makeNextInstructionDiff(state, instruction.byteLength)];
}

function makeAddDiffs(
  state: ReadonlySimulationState,
  dest: RegisterOrEac,
  sourceValue: number,
  word: boolean,
  instructionLength: number,
): SimulationStateDiff {
  const destValue = getRegisterOrEacValue(state, dest, word, 'ds');

  const auxCarry = (destValue & 0b1111) + (sourceValue & 0b1111) > 0b1111;

  let result = destValue + sourceValue;

  const max = word ? 65536 : 128;

  let carry = false;

  if (result >= max) {
    carry = true;
  }

  result = result % max;

  const overflow = getOverflowFlag(destValue, sourceValue, result, max);

  return [
    makeNextInstructionDiff(state, instructionLength),
    ...makeSetValueDiffs(state, dest, result, word, 'ds'),
    ...makeFlagDiffsForArithmeticOp(state, result, overflow, word, auxCarry, carry),
  ];
}

function makeOrDiffs(
  state: ReadonlySimulationState,
  dest: RegisterOrEac,
  sourceValue: number,
  word: boolean,
  instructionLength: number,
): SimulationStateDiff {
  const destValue = getRegisterOrEacValue(state, dest, word, 'ds');

  const result = destValue | sourceValue;

  return [
    makeNextInstructionDiff(state, instructionLength),
    ...makeSetValueDiffs(state, dest, result, word, 'ds'),
    ...makeFlagDiffsForLogicalOp(state, result, word),
  ];
}

function makeAndDiffs(
  state: ReadonlySimulationState,
  dest: RegisterOrEac,
  sourceValue: number,
  word: boolean,
  instructionLength: number,
): SimulationStateDiff {
  const destValue = getRegisterOrEacValue(state, dest, word, 'ds');

  const result = destValue & sourceValue;

  return [
    makeNextInstructionDiff(state, instructionLength),
    ...makeSetValueDiffs(state, dest, result, word, 'ds'),
    ...makeFlagDiffsForLogicalOp(state, result, word),
  ];
}

function makeSubDiffs(
  state: ReadonlySimulationState,
  dest: RegisterOrEac,
  sourceValue: number,
  word: boolean,
  instructionLength: number,
): SimulationStateDiff {
  const { result, flagDiffs } = makeSubOrCmpResults(state, dest, sourceValue, word);

  return [
    makeNextInstructionDiff(state, instructionLength),
    ...makeSetValueDiffs(state, dest, result, word, 'ds'),
    ...flagDiffs,
  ];
}

function makeCmpDiffs(
  state: ReadonlySimulationState,
  dest: RegisterOrEac,
  sourceValue: number,
  word: boolean,
  instructionLength: number,
): SimulationStateDiff {
  const { flagDiffs } = makeSubOrCmpResults(state, dest, sourceValue, word);

  return [makeNextInstructionDiff(state, instructionLength), ...flagDiffs];
}

function makeSubOrCmpResults(
  state: ReadonlySimulationState,
  dest: RegisterOrEac,
  sourceValue: number,
  word: boolean,
): {
  readonly result: number;
  readonly flagDiffs: Generator<SimulationStatePropertyDiff>;
} {
  const destValue = getRegisterOrEacValue(state, dest, word, 'ds');

  const auxCarry = (destValue & 0b1111) < (sourceValue & 0b1111);

  let result = destValue - sourceValue;

  const max = word ? 65536 : 128;

  let carry = false;

  if (result < 0) {
    carry = true;
  }

  result = result % max;

  if (result < 0) {
    result += max;
  }

  const overflow = getOverflowFlag(destValue, sourceValue, result, max);

  return {
    result,
    flagDiffs: makeFlagDiffsForArithmeticOp(state, result, overflow, word, auxCarry, carry),
  };
}

// https://en.wikipedia.org/wiki/Overflow_flag
function getOverflowFlag(
  destValue: number,
  sourceValue: number,
  result: number,
  max: 128 | 65536,
): boolean {
  const destSignBit = destValue >= max / 2;
  const sourceSignBit = sourceValue >= max / 2;
  const resultSignBit = result >= max / 2;

  return resultSignBit !== destSignBit && sourceSignBit !== destSignBit;
}

function getRegisterOrEacValue(
  state: ReadonlySimulationState,
  registerOrEac: RegisterOrEac,
  word: boolean,
  defaultSegment: SegmentRegister,
): number {
  if (registerOrEac.kind === 'reg') {
    return getRegisterValue(state, registerOrEac);
  } else {
    return getMemoryValueFromEac(state, registerOrEac, word, defaultSegment);
  }
}

function getRegisterValue(state: ReadonlySimulationState, register: Register): number {
  if (isWordRegister(register)) {
    return state[register.name];
  } else {
    const mainRegister = mainRegisterTable[register.name];

    if (isHigh8BitRegister(register)) {
      return (state[mainRegister] & 0xff00) >> 8;
    } else {
      return state[mainRegister] & 0x00ff;
    }
  }
}

function getMemoryValueFromEac(
  state: ReadonlySimulationState,
  eac: EffectiveAddressCalculation,
  word: boolean,
  defaultSegment: SegmentRegister,
): number {
  const address = getMemoryAddressFromEac(state, eac, defaultSegment);

  return word ? state.memory.readWord(address) : state.memory.readByte(address);
}

function getMemoryAddressFromEac(
  state: ReadonlySimulationState,
  eac: EffectiveAddressCalculation,
  defaultSegment: SegmentRegister,
): number {
  let addressFromRegigsterPart: number;
  switch (eac.calculationKind) {
    case 'bx + si':
      addressFromRegigsterPart = state.bx + state.si;
      break;
    case 'bx + di':
      addressFromRegigsterPart = state.bx + state.di;
      break;
    case 'bp + si':
      addressFromRegigsterPart = state.bp + state.si;
      break;
    case 'bp + di':
      addressFromRegigsterPart = state.bp + state.di;
      break;
    case 'si':
      addressFromRegigsterPart = state.si;
      break;
    case 'di':
      addressFromRegigsterPart = state.di;
      break;
    case 'bp':
      addressFromRegigsterPart = state.bp;
      break;
    case 'bx':
      addressFromRegigsterPart = state.bx;
      break;
    case 'DIRECT ADDRESS':
      addressFromRegigsterPart = 0;
      break;
  }

  const segmentRegister = eac.segmentOverridePrefix ?? defaultSegment;

  return getMemoryAddress(
    state,
    addressFromRegigsterPart + (eac.displacement ?? 0),
    segmentRegister,
  );
}

function getMemoryAddress(
  state: ReadonlySimulationState,
  addressInSegment: number,
  segmentRegister: SegmentRegister,
): number {
  const segmentValue = state[segmentRegister];

  return ((segmentValue << 4) + addressInSegment) % total8086MemorySizeInBytes;
}

function* makeSetValueDiffs(
  state: ReadonlySimulationState,
  dest: RegisterOrEac,
  value: number,
  wordIfMemoryDest: boolean,
  defaultSegment: SegmentRegister,
): Generator<SimulationStatePropertyDiff> {
  if (dest.kind === 'reg') {
    yield makeSetRegisterValueDiff(state, dest, value);
  } else {
    yield* makeSetMemoryValueDiffsFromEac(state, dest, value, wordIfMemoryDest, defaultSegment);
  }
}

function makeSetRegisterValueDiff(
  state: ReadonlySimulationState,
  register: Register,
  value: number,
): SimulationStatePropertyDiff {
  let mainRegister: WordRegisterName;
  let newValue: number;

  if (isWordRegister(register)) {
    mainRegister = register.name;
    newValue = value;
  } else {
    mainRegister = mainRegisterTable[register.name];

    if (isHigh8BitRegister(register)) {
      newValue = (state[mainRegister] & 0x00ff) + (value << 8);
    } else {
      newValue = (state[mainRegister] & 0xff00) + value;
    }
  }

  return makeSetNumberDiff(state, mainRegister, newValue);
}

function makeNextInstructionDiff(
  state: ReadonlySimulationState,
  currentInstructionLength: number,
): SimulationStatePropertyDiff {
  return makeSetNumberDiff(state, 'ip', state.ip + currentInstructionLength);
}

function* makeSetMemoryValueDiffsFromEac(
  state: ReadonlySimulationState,
  eac: EffectiveAddressCalculation,
  value: number,
  word: boolean,
  defaultSegment: SegmentRegister,
): Generator<SimulationStatePropertyDiff> {
  const address = getMemoryAddressFromEac(state, eac, defaultSegment);

  yield* makeSetMemoryValueDiffs(state, address, value, word);
}

function* makeSetMemoryValueDiffs(
  state: ReadonlySimulationState,
  address: number,
  value: number,
  word: boolean,
): Generator<SimulationStatePropertyDiff> {
  if (word) {
    const leastSignificantByte = value & 0x00ff;
    const mostSignificantByte = (value & 0xff00) >> 8;

    yield makeSetMemoryValueDiff(state, address + 1, mostSignificantByte);
    yield makeSetMemoryValueDiff(state, address, leastSignificantByte);
  } else {
    yield makeSetMemoryValueDiff(state, address, value);
  }
}

function* makeFlagDiffsForLogicalOp(
  state: ReadonlySimulationState,
  result: number,
  word: boolean,
): Generator<SimulationStatePropertyDiff> {
  yield makeSetFlagDiff(state, 'overflowFlag', false);
  yield makeSetSignFlagDiff(state, result, word);
  yield makeSetZeroFlagDiff(state, result);
  yield makeSetParityFlagDiff(state, result);
  yield makeSetFlagDiff(state, 'carryFlag', false);
}

function* makeFlagDiffsForArithmeticOp(
  state: ReadonlySimulationState,
  result: number,
  overflow: boolean,
  word: boolean,
  auxCarry: boolean,
  carry: boolean,
): Generator<SimulationStatePropertyDiff> {
  yield makeSetFlagDiff(state, 'overflowFlag', overflow);
  yield makeSetSignFlagDiff(state, result, word);
  yield makeSetZeroFlagDiff(state, result);
  yield makeSetFlagDiff(state, 'auxCarryFlag', auxCarry);
  yield makeSetParityFlagDiff(state, result);
  yield makeSetFlagDiff(state, 'carryFlag', carry);
}

function makeSetZeroFlagDiff(
  state: ReadonlySimulationState,
  result: number,
): SimulationStatePropertyDiff {
  return makeSetFlagDiff(state, 'zeroFlag', result === 0);
}

function makeSetSignFlagDiff(
  state: ReadonlySimulationState,
  result: number,
  word: boolean,
): SimulationStatePropertyDiff {
  const max = word ? 65536 : 128;
  const value = (result & (max / 2)) !== 0;

  return makeSetFlagDiff(state, 'signFlag', value);
}

// https://medium.com/free-code-camp/algorithmic-problem-solving-efficiently-computing-the-parity-of-a-stream-of-numbers-cd652af14643
function makeSetParityFlagDiff(
  state: ReadonlySimulationState,
  result: number,
): SimulationStatePropertyDiff {
  let parityCheckResult = result & 0xff;
  parityCheckResult ^= parityCheckResult >> 4;
  parityCheckResult ^= parityCheckResult >> 2;
  parityCheckResult ^= parityCheckResult >> 1;

  return {
    key: 'parityFlag',
    from: state.parityFlag,
    to: !(parityCheckResult & 1),
  };
}

function makeSetFlagDiff(
  state: ReadonlySimulationState,
  flag: KeyOfType<ReadonlySimulationState, boolean>,
  value: boolean,
): GenericSimulationStatePropertyDiff<boolean> {
  return {
    key: flag,
    from: state[flag],
    to: value,
  };
}

function makeSetNumberDiff(
  state: ReadonlySimulationState,
  key: KeyOfType<ReadonlySimulationState, number>,
  value: number,
): GenericSimulationStatePropertyDiff<number> {
  return {
    key,
    from: state[key],
    to: value,
  };
}

function makeSetMemoryValueDiff(
  state: ReadonlySimulationState,
  address: number,
  value: number,
): MemoryDiff {
  return {
    address,
    from: state.memory.readByte(address),
    to: value,
  };
}

function applyDiff(state: SimulationState, diff: SimulationStateDiff): void {
  for (const propertyDiff of diff) {
    if ('key' in propertyDiff) {
      // @ts-expect-error the type of SimulationStatePropertyDiff guarantees that we've got the correct
      // relationship between the key and the type of to (or from), but TS doesn't understand that relationship
      state[propertyDiff.key] = propertyDiff.to;
    } else {
      state.memory.writeByte(propertyDiff.address, propertyDiff.to);
    }
  }
}

/**
 * Handle any 8-bit sign extended negative values so that the carry flag works correctly!
 */
function sanitize8BitSignExtendedNegatives(value: number): number {
  if (value < 0) {
    return 65536 + value;
  } else {
    return value;
  }
}
