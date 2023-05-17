import { DecodedInstruction, EffectiveAddressCalculation, RegisterOrEac } from './decoder';
import { KeyOfType } from './key-of-type';
import { Memory, ReadonlyMemory } from './memory';
import {
  Register,
  SegmentRegister,
  WordRegisterName,
  bpReg,
  bxReg,
  diReg,
  isHigh8BitRegister,
  isWordRegister,
  mainRegisterTable,
  siReg,
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

    case 'subRegisterMemoryAndRegisterToEither': {
      const regOperand = getRegisterOperand(instruction);

      const word = isWordRegister(regOperand);

      const sourceValue = getRegisterOrEacValue(state, instruction.op2, word, 'ds');

      return makeSubDiffs(state, instruction.op1, sourceValue, word, instruction.byteLength);
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
        dest.kind === 'reg'
          ? makeSetRegisterValueDiff(state, dest, sourceValue)
          : makeSetMemoryValueDiff(state, dest, sourceValue, word, 'ds'),
      ];
    }

    case 'movSegmentRegisterToRegisterMemory': {
      const dest = instruction.op1;

      const sourceValue = state[instruction.op2];

      return [
        makeNextInstructionDiff(state, instruction.byteLength),
        dest.kind === 'reg'
          ? makeSetRegisterValueDiff(state, dest, sourceValue)
          : makeSetMemoryValueDiff(state, dest, sourceValue, true, 'ds'),
      ];
    }

    case 'movRegisterMemoryToSegmentRegister': {
      const source = instruction.op2;

      const sourceValue = getRegisterOrEacValue(state, source, true, 'ds');

      return [
        makeNextInstructionDiff(state, instruction.byteLength),
        {
          key: instruction.op1,
          from: state[instruction.op1],
          to: sourceValue,
        },
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
        dest.kind === 'reg'
          ? makeSetRegisterValueDiff(state, dest, instruction.op2)
          : makeSetMemoryValueDiff(state, dest, instruction.op2, dest.length === 2, 'ds'),
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
        ? [{ key: 'ip', from: state.ip, to: state.ip + instruction.byteLength + instruction.op1 }]
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
      ? {
          key: 'ip',
          from: state.ip,
          to: state.ip + instruction.byteLength + instruction.op1,
        }
      : makeNextInstructionDiff(state, instruction.byteLength),
    {
      key: 'cx',
      from: state.cx,
      to: state.cx - 1,
    },
  ];
}

function makeShortLabelJumpDiff(
  state: ReadonlySimulationState,
  instruction: { op1: number; byteLength: number },
  condition: boolean,
): SimulationStateDiff {
  return condition
    ? [{ key: 'ip', from: state.ip, to: state.ip + instruction.byteLength + instruction.op1 }]
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

  let overflow = false;
  let carry = false;
  let sign = false;

  if (result >= max) {
    carry = true;
  }

  result = result % max;

  const destSignBit = destValue >= max / 2;
  const sourceSignBit = sourceValue >= max / 2;
  const resultSignBit = result >= max / 2;

  if (destSignBit !== resultSignBit && destSignBit === sourceSignBit) {
    overflow = true;
  }

  if ((result & (max / 2)) !== 0) {
    sign = true;
  }

  return [
    makeNextInstructionDiff(state, instructionLength),
    dest.kind === 'reg'
      ? makeSetRegisterValueDiff(state, dest, result)
      : makeSetMemoryValueDiff(state, dest, result, word, 'ds'),
    ...makeFlagDiffsForArithmeticOp(state, result, overflow, sign, auxCarry, carry),
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
    dest.kind === 'reg'
      ? makeSetRegisterValueDiff(state, dest, result)
      : makeSetMemoryValueDiff(state, dest, sourceValue, word, 'ds'),
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
  let overflow = false;
  let sign = false;

  if (result < 0) {
    carry = true;
  }

  result = result % max;

  if (result < 0) {
    result += max;
  }

  const destSignBit = destValue >= max / 2;
  const sourceSignBit = sourceValue >= max / 2;
  const resultSignBit = result >= max / 2;

  // https://en.wikipedia.org/wiki/Overflow_flag
  if (resultSignBit !== destSignBit && sourceSignBit !== destSignBit) {
    overflow = true;
  }

  if ((result & (max / 2)) !== 0) {
    sign = true;
  }

  return {
    result,
    flagDiffs: makeFlagDiffsForArithmeticOp(state, result, overflow, sign, auxCarry, carry),
  };
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
    return getMemoryValue(state, registerOrEac, word, defaultSegment);
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

function getMemoryValue(
  state: ReadonlySimulationState,
  eac: EffectiveAddressCalculation,
  word: boolean,
  defaultSegment: SegmentRegister,
): number {
  const address = getMemoryAddress(state, eac, defaultSegment);

  return word ? state.memory.readWord(address) : state.memory.readByte(address);
}

function getMemoryAddress(
  state: ReadonlySimulationState,
  eac: EffectiveAddressCalculation,
  defaultSegment: SegmentRegister,
): number {
  let addressFromRegigsterPart: number;
  switch (eac.calculationKind) {
    case 'bx + si':
      addressFromRegigsterPart = getRegisterValue(state, bxReg) + getRegisterValue(state, siReg);
      break;
    case 'bx + di':
      addressFromRegigsterPart = getRegisterValue(state, bxReg) + getRegisterValue(state, diReg);
      break;
    case 'bp + si':
      addressFromRegigsterPart = getRegisterValue(state, bpReg) + getRegisterValue(state, siReg);
      break;
    case 'bp + di':
      addressFromRegigsterPart = getRegisterValue(state, bpReg) + getRegisterValue(state, diReg);
      break;
    case 'si':
      addressFromRegigsterPart = getRegisterValue(state, siReg);
      break;
    case 'di':
      addressFromRegigsterPart = getRegisterValue(state, diReg);
      break;
    case 'bp':
      addressFromRegigsterPart = getRegisterValue(state, bpReg);
      break;
    case 'bx':
      addressFromRegigsterPart = getRegisterValue(state, bxReg);
      break;
    case 'DIRECT ADDRESS':
      addressFromRegigsterPart = 0;
      break;
  }

  const segmentRegister = eac.segmentOverridePrefix ?? defaultSegment;

  const segmentValue = state[segmentRegister];

  return (segmentValue << 4) + (addressFromRegigsterPart + (eac.displacement ?? 0));
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

  return {
    key: mainRegister,
    from: state[mainRegister],
    to: newValue,
  };
}

function makeSetMemoryValueDiff(
  state: ReadonlySimulationState,
  eac: EffectiveAddressCalculation,
  value: number,
  word: boolean,
  defaultSegment: SegmentRegister,
): SimulationStatePropertyDiff {
  const address = getMemoryAddress(state, eac, defaultSegment);

  return {
    address,
    from: word ? state.memory.readWord(address) : state.memory.readByte(address),
    to: value,
  };
}

function* makeFlagDiffsForArithmeticOp(
  state: ReadonlySimulationState,
  result: number,
  overflow: boolean,
  sign: boolean,
  auxCarry: boolean,
  carry: boolean,
): Generator<SimulationStatePropertyDiff> {
  yield {
    key: 'overflowFlag',
    from: state.overflowFlag,
    to: overflow,
  };

  yield {
    key: 'signFlag',
    from: state.signFlag,
    to: sign,
  };

  yield {
    key: 'zeroFlag',
    from: state.zeroFlag,
    to: result === 0,
  };

  yield {
    key: 'auxCarryFlag',
    from: state.auxCarryFlag,
    to: auxCarry,
  };

  // https://medium.com/free-code-camp/algorithmic-problem-solving-efficiently-computing-the-parity-of-a-stream-of-numbers-cd652af14643
  let parityCheckResult = result & 0xff;
  parityCheckResult ^= parityCheckResult >> 4;
  parityCheckResult ^= parityCheckResult >> 2;
  parityCheckResult ^= parityCheckResult >> 1;

  yield {
    key: 'parityFlag',
    from: state.parityFlag,
    to: !(parityCheckResult & 1),
  };

  yield {
    key: 'carryFlag',
    from: state.carryFlag,
    to: carry,
  };
}

function makeNextInstructionDiff(
  state: ReadonlySimulationState,
  currentInstructionLength: number,
): SimulationStatePropertyDiff {
  return {
    key: 'ip',
    from: state.ip,
    to: state.ip + currentInstructionLength,
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
