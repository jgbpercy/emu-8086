import { DecodedInstruction } from './decoder';
import {
  Register,
  WordRegisterName,
  isHigh8BitRegister,
  isWordRegister,
  mainRegisterTable,
} from './register-data';

export interface SimulationState {
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

type KeyOfType<TObject, TValue> = {
  [K in keyof TObject]-?: TObject[K] extends TValue ? K : never;
}[keyof TObject];

export interface GenericSimulationStatePropertyDiff<T> {
  key: KeyOfType<SimulationState, T>;
  from: T;
  to: T;
}

export type SimulationStatePropertyDiff =
  | GenericSimulationStatePropertyDiff<number>
  | GenericSimulationStatePropertyDiff<boolean>;

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
  state: Readonly<SimulationState>,
  instruction: DecodedInstruction,
): Readonly<SimulationStateDiff> {
  switch (instruction.kind) {
    case 'addRegisterMemoryWithRegisterToEither': {
      const dest = instruction.op1;
      const source = instruction.op2;

      if (dest.kind === 'reg' && source.kind === 'reg') {
        const sourceValue = getRegisterValue(state, source);

        return makeRegisterDestinationAddDiffs(state, dest, sourceValue, instruction.byteLength);
      } else {
        return [];
      }
    }

    case 'addImmediateToAccumulator':
      return makeRegisterDestinationAddDiffs(
        state,
        instruction.op1,
        instruction.op2,
        instruction.byteLength,
      );

    case 'subRegisterMemoryAndRegisterToEither': {
      const dest = instruction.op1;
      const source = instruction.op2;

      if (dest.kind === 'reg' && source.kind === 'reg') {
        const sourceValue = getRegisterValue(state, source);

        return makeRegisterDestinationSubDiffs(state, dest, sourceValue, instruction.byteLength);
      } else {
        return [];
      }
    }

    case 'subImmediateFromAccumulator':
      return makeRegisterDestinationSubDiffs(
        state,
        instruction.op1,
        instruction.op2,
        instruction.byteLength,
      );

    case 'cmpRegisterMemoryAndRegister': {
      const dest = instruction.op1;
      const source = instruction.op2;

      if (dest.kind === 'reg' && source.kind === 'reg') {
        const sourceValue = getRegisterValue(state, source);

        return makeRegisterDestinationCmpDiffs(state, dest, sourceValue, instruction.byteLength);
      } else {
        return [];
      }
    }

    case 'cmpImmediateWithAccumulator':
      return makeRegisterDestinationCmpDiffs(
        state,
        instruction.op1,
        instruction.op2,
        instruction.byteLength,
      );

    case 'addImmediateToRegisterMemory': {
      const dest = instruction.op1;

      if (dest.kind === 'reg') {
        return makeRegisterDestinationAddDiffs(
          state,
          dest,
          sanitize8BitSignExtendedNegatives(instruction.op2),
          instruction.byteLength,
        );
      } else {
        return [];
      }
    }

    case 'subImmediateToRegisterMemory': {
      const dest = instruction.op1;

      if (dest.kind === 'reg') {
        return makeRegisterDestinationSubDiffs(
          state,
          dest,
          sanitize8BitSignExtendedNegatives(instruction.op2),
          instruction.byteLength,
        );
      } else {
        return [];
      }
    }

    case 'cmpImmediateToRegisterMemory': {
      const dest = instruction.op1;

      if (dest.kind === 'reg') {
        return makeRegisterDestinationCmpDiffs(
          state,
          dest,
          sanitize8BitSignExtendedNegatives(instruction.op2),
          instruction.byteLength,
        );
      } else {
        return [];
      }
    }

    case 'movRegisterMemoryToFromRegister': {
      const dest = instruction.op1;
      const source = instruction.op2;

      if (dest.kind === 'reg' && source.kind === 'reg') {
        const sourceValue = getRegisterValue(state, source);

        return [
          makeNextInstructionDiff(state, instruction.byteLength),
          makeSetRegisterValueDiff(state, dest, sourceValue),
        ];
      } else {
        return [];
      }
    }

    case 'movSegmentRegisterToRegisterMemory': {
      const dest = instruction.op1;

      const sourceValue = state[instruction.op2];

      if (dest.kind === 'reg') {
        return [
          makeNextInstructionDiff(state, instruction.byteLength),
          makeSetRegisterValueDiff(state, dest, sourceValue),
        ];
      } else {
        return [];
      }
    }

    case 'movRegisterMemoryToSegmentRegister': {
      const source = instruction.op2;

      if (source.kind === 'reg') {
        const sourceValue = getRegisterValue(state, source);

        return [
          makeNextInstructionDiff(state, instruction.byteLength),
          {
            key: instruction.op1,
            from: state[instruction.op1],
            to: sourceValue,
          },
        ];
      } else {
        return [];
      }
    }

    case 'movImmediateToRegister':
      return [
        makeNextInstructionDiff(state, instruction.byteLength),
        makeSetRegisterValueDiff(state, instruction.op1, instruction.op2),
      ];

    case 'movImmediateToRegisterMemory': {
      const dest = instruction.op1;
      if (dest.kind === 'reg') {
        return [
          makeNextInstructionDiff(state, instruction.byteLength),
          makeSetRegisterValueDiff(state, dest, instruction.op2),
        ];
      } else {
        return [];
      }
    }

    default:
      return [];
  }
}

function makeRegisterDestinationAddDiffs(
  state: Readonly<SimulationState>,
  destRegister: Register,
  sourceValue: number,
  instructionLength: number,
): SimulationStateDiff {
  const destValue = getRegisterValue(state, destRegister);

  const auxCarry = (destValue & 0b1111) + (sourceValue & 0b1111) > 0b1111;

  let result = destValue + sourceValue;

  const max = isWordRegister(destRegister) ? 65536 : 128;

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
    makeSetRegisterValueDiff(state, destRegister, result),
    ...makeFlagDiffsForArithmeticOp(state, result, overflow, sign, auxCarry, carry),
  ];
}

function makeRegisterDestinationSubDiffs(
  state: Readonly<SimulationState>,
  destRegister: Register,
  sourceValue: number,
  instructionLength: number,
): SimulationStateDiff {
  const { result, flagDiffs } = makeRegisterDesintationSubOrCmpResults(
    state,
    destRegister,
    sourceValue,
  );

  return [
    makeNextInstructionDiff(state, instructionLength),
    makeSetRegisterValueDiff(state, destRegister, result),
    ...flagDiffs,
  ];
}

function makeRegisterDestinationCmpDiffs(
  state: Readonly<SimulationState>,
  destRegister: Register,
  sourceValue: number,
  instructionLength: number,
): SimulationStateDiff {
  const { flagDiffs } = makeRegisterDesintationSubOrCmpResults(state, destRegister, sourceValue);

  return [makeNextInstructionDiff(state, instructionLength), ...flagDiffs];
}

function makeRegisterDesintationSubOrCmpResults(
  state: Readonly<SimulationState>,
  destRegister: Register,
  sourceValue: number,
): {
  readonly result: number;
  readonly flagDiffs: Generator<SimulationStatePropertyDiff>;
} {
  const destValue = getRegisterValue(state, destRegister);

  const auxCarry = (destValue & 0b1111) < (sourceValue & 0b1111);

  let result = destValue - sourceValue;

  const max = isWordRegister(destRegister) ? 65536 : 128;

  let carry = false;
  let overflow = false;
  let sign = false;

  if (result < 0) {
    carry = true;
  }

  result = result % max;

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

function getRegisterValue(state: Readonly<SimulationState>, register: Register): number {
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

function makeSetRegisterValueDiff(
  state: Readonly<SimulationState>,
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

function* makeFlagDiffsForArithmeticOp(
  state: Readonly<SimulationState>,
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
  state: SimulationState,
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
    // @ts-expect-error the type of SimulationStatePropertyDiff guarantees that we've got the correct
    // relationship between the key and the type of to (or from), but TS doesn't understand that relationship
    state[propertyDiff.key] = propertyDiff.to;
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
