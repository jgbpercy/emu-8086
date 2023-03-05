import { DecodedInstruction } from './decoder';

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
        instructionStrings[index] = `mov ${instruction.dest}, ${instruction.source}`;
        break;
      case 'UNKNOWN':
        instructionStrings[index] = `UNKNOWN`;
    }

    index++;
  }

  return instructionStrings.join('\n');
}
