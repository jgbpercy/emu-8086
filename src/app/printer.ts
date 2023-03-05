import { DecodedInstruction, SourceOrDestination } from './decoder';

export function printDecodedInstructions(instructions: ReadonlyArray<DecodedInstruction>): string {
  const instructionStrings = new Array<string>(instructions.length + 1);

  instructionStrings[0] = 'bits 16';

  let index = 1;

  for (const instruction of instructions) {
    switch (instruction.kind) {
      case 'ADD':
        instructionStrings[index] = 'UNKNOWN';
        break;
      case 'MOV':
        instructionStrings[index] = `mov ${printRm(instruction.dest)}, ${printRm(
          instruction.source,
        )}`;
        break;
      case 'UNKNOWN':
        instructionStrings[index] = `UNKNOWN`;
    }

    index++;
  }

  return instructionStrings.join('\n');
}

function printRm(rm: SourceOrDestination): string {
  if (rm.kind === 'reg') {
    return rm.register;
  } else {
    if (rm.displacement !== null && rm.displacement !== 0) {
      if (rm.text === 'DIRECT ADDRESS') {
        return `[${rm.displacement}]`;
      } else {
        return `[${rm.text} + ${rm.displacement}]`;
      }
    } else {
      return `[${rm.text}]`;
    }
  }
}
