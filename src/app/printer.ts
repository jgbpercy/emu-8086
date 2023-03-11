import { DecodedInstruction, RegisterOrEac } from './decoder';

export function printDecodedInstructions(instructions: ReadonlyArray<DecodedInstruction>): string {
  const instructionStrings = new Array<string>(instructions.length + 1);

  instructionStrings[0] = 'bits 16';

  let index = 1;

  for (const instruction of instructions) {
    let instructionString: string;

    // Order is first appearance in decoder switch (i.e. earliest byte that encodes the instruction)
    switch (instruction.kind) {
      case 'addRegisterMemoryWithRegisterToEither': {
        instructionString = printOpDestSourceInstruction('add', instruction);
        break;
      }

      case 'addImmediateToAccumulator': {
        instructionString = `add ${instruction.dest.register}, ${instruction.data}`;
        break;
      }

      case 'pushSegmentRegister': {
        instructionString = `push ${instruction.register}`;
        break;
      }

      case 'popSegmentRegister': {
        instructionString = `pop ${instruction.register}`;
        break;
      }

      case 'orRegisterMemoryAndRegisterToEither': {
        instructionString = printOpDestSourceInstruction('or', instruction);
        break;
      }

      case 'orImmediateToAccumulator': {
        instructionString = `or ${instruction.dest.register}, ${instruction.data}`;
        break;
      }

      case 'adcRegisterMemoryWithRegisterToEither': {
        instructionString = printOpDestSourceInstruction('adc', instruction);
        break;
      }

      case 'adcImmediateToAccumulator': {
        instructionString = `adc ${instruction.dest.register}, ${instruction.data}`;
        break;
      }

      case 'sbbRegisterMemoryAndRegisterToEither': {
        instructionString = printOpDestSourceInstruction('sbb', instruction);
        break;
      }

      case 'sbbImmediateFromAccumulator': {
        instructionString = `sbb ${instruction.dest.register}, ${instruction.data}`;
        break;
      }

      case 'andRegisterMemoryWithRegisterToEither': {
        instructionString = printOpDestSourceInstruction('and', instruction);
        break;
      }

      case 'andImmediateToAccumulator': {
        instructionString = `and ${instruction.dest.register}, ${instruction.data}`;
        break;
      }

      case 'decimalAdjustForAdd': {
        instructionString = `daa`;
        break;
      }

      case 'subRegisterMemoryAndRegisterToEither': {
        instructionString = printOpDestSourceInstruction('sub', instruction);
        break;
      }

      case 'subImmediateFromAccumulator': {
        instructionString = `sub ${instruction.dest.register}, ${instruction.data}`;
        break;
      }

      case 'decimalAdjustForSubtract': {
        instructionString = 'das';
        break;
      }

      case 'xorRegisterMemoryAndRegisterToEither': {
        instructionString = printOpDestSourceInstruction('xor', instruction);
        break;
      }

      case 'xorImmediateToAccumulator': {
        instructionString = `xor ${instruction.dest.register}, ${instruction.data}`;
        break;
      }

      case 'asciiAdjustForAdd': {
        instructionString = 'aaa';
        break;
      }

      case 'cmpRegisterMemoryAndRegister': {
        instructionString = printOpDestSourceInstruction('cmp', instruction);
        break;
      }

      case 'cmpImmediateWithAccumulator': {
        instructionString = `cmp ${instruction.dest.register}, ${instruction.data}`;
        break;
      }

      case 'asciiAdjustForSubtract': {
        instructionString = 'aas';
        break;
      }

      case 'incRegister': {
        instructionString = `inc ${instruction.register.register}`;
        break;
      }

      case 'decRegister': {
        instructionString = `dec ${instruction.register.register}`;
        break;
      }

      case 'pushRegister': {
        instructionString = `push ${instruction.register.register}`;
        break;
      }

      case 'popRegister': {
        instructionString = `pop ${instruction.register.register}`;
        break;
      }

      case 'movRegisterMemoryToFromRegister':
      case 'movMemoryToFromAccumulator': {
        instructionString = printOpDestSourceInstruction('mov', instruction);
        break;
      }

      case 'movImmediateToRegister': {
        instructionString = `mov ${instruction.dest.register}, ${instruction.data}`;
        break;
      }

      case 'movImmediateToRegisterMemory': {
        const destString = printRegisterOrEac(instruction.dest);
        const dataString = printDataWithSize(instruction.data);

        instructionString = `mov ${destString}, ${dataString}`;

        break;
      }

      case 'NOT USED': {
        instructionString = `(not used) ${toByteString(instruction.byte)}`;
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

function printOpDestSourceInstruction(
  op: string,
  instruction: { dest: RegisterOrEac; source: RegisterOrEac },
): string {
  const destString = printRegisterOrEac(instruction.dest);
  const sourceString = printRegisterOrEac(instruction.source);

  return `${op} ${destString}, ${sourceString}`;
}

function printRegisterOrEac(rm: RegisterOrEac): string {
  if (rm.kind === 'reg') {
    return rm.register;
  } else {
    const segmentOverridePrefixString = rm.segmentOverridePrefix
      ? `${rm.segmentOverridePrefix}: `
      : '';

    if (rm.displacement !== null && rm.displacement !== 0) {
      if (rm.text === 'DIRECT ADDRESS') {
        return `${segmentOverridePrefixString}[${rm.displacement}]`;
      } else {
        const signedDisplacementString = printSignedAsOperation(rm.displacement);

        return `${segmentOverridePrefixString}[${rm.text} ${signedDisplacementString}]`;
      }
    } else {
      return `${segmentOverridePrefixString}[${rm.text}]`;
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

// Lazy implementation
function toByteString(byte: number): string {
  const shortString = byte.toString(2);

  const prefix = '0'.repeat(8 - shortString.length);

  const fullString = `${prefix}${shortString}`;

  return `${fullString.substring(0, 4)} ${fullString.substring(4, 8)}`;
}
