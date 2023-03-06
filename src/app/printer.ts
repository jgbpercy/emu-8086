import { DecodedInstruction, SourceOrDestination } from './decoder';

export function printDecodedInstructions(instructions: ReadonlyArray<DecodedInstruction>): string {
  const instructionStrings = new Array<string>(instructions.length + 1);

  instructionStrings[0] = 'bits 16';

  let index = 1;

  for (const instruction of instructions) {
    let instructionString: string;

    switch (instruction.kind) {
      case 'movRegisterMemoryToFromRegister': {
        const destString = printRm(instruction.dest);
        const sourceString = printRm(instruction.source);

        instructionString = `mov ${destString}, ${sourceString}`;

        break;
      }

      case 'movMemoryToFromAccumulator': {
        const destString = printRm(instruction.dest);
        const sourceString = printRm(instruction.source);

        instructionString = `mov ${destString}, ${sourceString}`;

        break;
      }

      case 'movImmediateToRegister':
        instructionString = `mov ${instruction.dest.register}, ${instruction.data}`;

        break;

      case 'movImmediateToRegisterMemory': {
        const destString = printRm(instruction.dest);
        const dataString = printDataWithSize(instruction.data);

        instructionString = `mov ${destString}, ${dataString}`;

        break;
      }

      case 'UNKNOWN':
        instructionString = `UNKNOWN`;
    }

    instructionStrings[index] = instructionString;

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
        return `[${rm.text} ${printSignedAsOperation(rm.displacement)}]`;
      }
    } else {
      return `[${rm.text}]`;
    }
  }
}

function printSignedAsOperation(val: number): string {
  if (val >= 0) {
    return `+ ${val}`;
  } else {
    return `- ${Math.abs(val)}`;
  }
}

function printDataWithSize(val: number): string {
  const sizeLabel = val > 255 ? 'word' : 'byte';
  return `${sizeLabel} ${val}`;
}
