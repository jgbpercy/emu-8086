import { KeyOfType } from './key-of-type';
import { printNum } from './num.pipe';
import {
  GenericSimulationStatePropertyDiff,
  SimulationState,
  SimulationStateDiff,
} from './simulator';

export interface SimulatedInstruction {
  readonly simulationStateDiff: SimulationStateDiff;
  readonly asm: string;
}

// lol hack cos we do flags differently
type CaseyFlagsState = [
  'C' | '',
  'P' | '',
  'A' | '',
  'Z' | '',
  'S' | '',
  'O' | '',
  'I' | '',
  'D' | '',
  'T' | '',
];

export function caseyPrint(
  fileName: string,
  state: SimulationState,
  simulatedInstructions: ReadonlyArray<SimulatedInstruction>,
): string {
  let result = `--- test\\${fileName} execution ---\n`;

  const flagsState: CaseyFlagsState = ['', '', '', '', '', '', '', '', ''];

  for (const { asm, simulationStateDiff: diff } of simulatedInstructions) {
    result += `${asm} ; ${caseyPrintRegisterDiffs(diff)}${caseyPrintFlagDiffs(diff, flagsState)}\n`;
  }

  result += '\nFinal registers:\n';

  result += caseyPrintFinalRegisterState(state, 'ax');
  result += caseyPrintFinalRegisterState(state, 'bx');
  result += caseyPrintFinalRegisterState(state, 'cx');
  result += caseyPrintFinalRegisterState(state, 'dx');

  result += caseyPrintFinalRegisterState(state, 'sp');
  result += caseyPrintFinalRegisterState(state, 'bp');
  result += caseyPrintFinalRegisterState(state, 'si');
  result += caseyPrintFinalRegisterState(state, 'di');

  result += caseyPrintFinalRegisterState(state, 'cs');
  result += caseyPrintFinalRegisterState(state, 'es');
  result += caseyPrintFinalRegisterState(state, 'ss');
  result += caseyPrintFinalRegisterState(state, 'ds');

  result += caseyPrintFinalRegisterState(state, 'ip');

  result += `   flags: ${caseyPrintFlags(flagsState)}\n\n`;

  return result;
}

function caseyPrintRegisterDiffs(diff: SimulationStateDiff): string {
  let result = '';

  let ipDiff: GenericSimulationStatePropertyDiff<number> | undefined = undefined;
  for (const propertyDiff of diff) {
    if (propertyDiff.key === 'ip') {
      ipDiff = propertyDiff;
    } else if (typeof propertyDiff.from === 'number') {
      result += caseyPrintRegisterDiff(propertyDiff);
    }
  }

  if (ipDiff) {
    result += caseyPrintRegisterDiff(ipDiff);
  }

  return result;
}

function caseyPrintFlagDiffs(diff: SimulationStateDiff, state: CaseyFlagsState): string {
  let anyFlagChanged = false;

  const before = caseyPrintFlags(state);

  for (const propertyDiff of diff) {
    let flagChanged = false;
    switch (propertyDiff.key) {
      case 'carryFlag':
        flagChanged = propertyDiff.from !== propertyDiff.to;
        state[0] = propertyDiff.to ? 'C' : '';
        break;

      case 'parityFlag':
        flagChanged = propertyDiff.from !== propertyDiff.to;
        state[1] = propertyDiff.to ? 'P' : '';
        break;

      case 'auxCarryFlag':
        flagChanged = propertyDiff.from !== propertyDiff.to;
        state[2] = propertyDiff.to ? 'A' : '';
        break;

      case 'zeroFlag':
        flagChanged = propertyDiff.from !== propertyDiff.to;
        state[3] = propertyDiff.to ? 'Z' : '';
        break;

      case 'signFlag':
        flagChanged = propertyDiff.from !== propertyDiff.to;
        state[4] = propertyDiff.to ? 'S' : '';
        break;

      case 'overflowFlag':
        flagChanged = propertyDiff.from !== propertyDiff.to;
        state[5] = propertyDiff.to ? 'O' : '';
        break;

      case 'interruptFlag':
        flagChanged = propertyDiff.from !== propertyDiff.to;
        state[6] = propertyDiff.to ? 'I' : '';
        break;

      case 'directionFlag':
        flagChanged = propertyDiff.from !== propertyDiff.to;
        state[7] = propertyDiff.to ? 'D' : '';
        break;

      case 'trapFlag':
        flagChanged = propertyDiff.from !== propertyDiff.to;
        state[8] = propertyDiff.to ? 'T' : '';
        break;

      default:
        break;
    }

    if (flagChanged) {
      anyFlagChanged = true;
    }
  }

  if (!anyFlagChanged) {
    return '';
  }

  const after = caseyPrintFlags(state);

  return `flags:${before}->${after} `;
}

function caseyPrintFlags(state: CaseyFlagsState): string {
  return state.filter((flag) => flag !== '').join('');
}

function caseyPrintRegisterDiff(propertyDiff: GenericSimulationStatePropertyDiff<number>): string {
  return `${propertyDiff.key}:${caseyPrintHex(propertyDiff.from)}->${caseyPrintHex(
    propertyDiff.to,
  )} `;
}

function caseyPrintFinalRegisterState(
  state: SimulationState,
  key: KeyOfType<SimulationState, number>,
): string {
  if (state[key] !== 0) {
    return `      ${key}: 0x${printNum(state[key], 16, 4)} (${printNum(state[key], 10, 0)})\n`;
  } else {
    return '';
  }
}

function caseyPrintHex(value: number): string {
  return `0x${printNum(value, 16, 0)}`;
}