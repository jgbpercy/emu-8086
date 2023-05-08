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
}

type KeyOfType<TObject, TValue> = {
  [K in keyof TObject]-?: TObject[K] extends TValue ? K : never;
}[keyof TObject];

interface GenericSimulationStatePropertyDiff<T> {
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
  state: SimulationState,
  instruction: DecodedInstruction,
): Readonly<SimulationStateDiff> {
  switch (instruction.kind) {
    case 'movRegisterMemoryToFromRegister': {
      const dest = instruction.op1;
      const source = instruction.op2;

      if (dest.kind === 'reg' && source.kind === 'reg') {
        const sourceValue = getRegisterValue(source, state);

        return simulateMovValueToRegisterDiff(state, dest, sourceValue);
      } else {
        return [];
      }
    }

    case 'movSegmentRegisterToRegisterMemory': {
      const dest = instruction.op1;

      const sourceValue = state[instruction.op2];

      if (dest.kind === 'reg') {
        return simulateMovValueToRegisterDiff(state, dest, sourceValue);
      } else {
        return [];
      }
    }

    case 'movRegisterMemoryToSegmentRegister': {
      const source = instruction.op2;

      if (source.kind === 'reg') {
        const sourceValue = getRegisterValue(source, state);

        return [
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
      return simulateMovValueToRegisterDiff(state, instruction.op1, instruction.op2);

    case 'movImmediateToRegisterMemory': {
      const dest = instruction.op1;
      if (dest.kind === 'reg') {
        return simulateMovValueToRegisterDiff(state, dest, instruction.op2);
      } else {
        return [];
      }
    }

    default:
      return [];
  }
}

function getRegisterValue(register: Register, state: Readonly<SimulationState>): number {
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

function simulateMovValueToRegisterDiff(
  state: Readonly<SimulationState>,
  register: Register,
  value: number,
): SimulationStateDiff {
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

  return [
    {
      key: mainRegister,
      from: state[mainRegister],
      to: newValue,
    },
  ];
}

function applyDiff(state: SimulationState, diff: SimulationStateDiff): void {
  for (const propertyDiff of diff) {
    // @ts-expect-error the type of SimulationStatePropertyDiff guarantees that we've got the correct
    // relationship between the key and the type of to (or from), but TS doesn't understand that relationship
    state[propertyDiff.key] = propertyDiff.to;
  }
}
