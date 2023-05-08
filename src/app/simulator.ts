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
    case 'movImmediateToRegister':
      return simulateMovImmediateToRegisterDiff(state, instruction.op1, instruction.op2);

    case 'movImmediateToRegisterMemory': {
      const dest = instruction.op1;
      if (dest.kind === 'reg') {
        return simulateMovImmediateToRegisterDiff(state, dest, instruction.op2);
      } else {
        return [];
      }
    }

    case 'movRegisterMemoryToFromRegister': {
      const dest = instruction.op1;
      const source = instruction.op2;

      if (dest.kind === 'reg' && source.kind === 'reg') {
        let sourceValue: number;
        if (isWordRegister(source)) {
          sourceValue = state[source.register];
        } else {
          const mainRegister = mainRegisterTable[source.register];

          if (isHigh8BitRegister(source)) {
            sourceValue = state[mainRegister] & 0xff00;
          } else {
            sourceValue = state[mainRegister] & 0x00ff;
          }
        }

        return simulateMovImmediateToRegisterDiff(state, dest, sourceValue);
      } else {
        return [];
      }
    }

    default:
      return [];
  }
}

function simulateMovImmediateToRegisterDiff(
  state: Readonly<SimulationState>,
  register: Register,
  value: number,
): SimulationStateDiff {
  let mainRegister: WordRegisterName;
  let newValue: number;

  if (isWordRegister(register)) {
    mainRegister = register.register;
    newValue = value;
  } else {
    mainRegister = mainRegisterTable[register.register];

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
