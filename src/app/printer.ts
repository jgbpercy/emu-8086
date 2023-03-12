import { DecodedInstruction, DecodedInstructionWithByteIndex, RegisterOrEac } from './decoder';

const bitsDirective = 'bits 16';

export function printDecodedInstructions(instructions: ReadonlyArray<DecodedInstruction>): string {
  const instructionStrings = new Array<string>(instructions.length + 1);

  instructionStrings[0] = bitsDirective;

  let index = 1;

  for (const instruction of instructions) {
    instructionStrings[index] = printInstruction(instruction);

    index++;
  }

  return instructionStrings.join('\n');
}

export function printDecodedInstructionsWithBytes(
  instructionsWithByteIndices: ReadonlyArray<DecodedInstructionWithByteIndex>,
  instructionBytes: Uint8Array,
): string {
  const strings = new Array<string>(instructionsWithByteIndices.length * 2 + 1);

  strings[0] = bitsDirective + '\n';

  let stringsIndex = 1;
  let instructionIndex = 0;

  for (const [byteIndex, instruction] of instructionsWithByteIndices) {
    let nextInstructionByteIndex: number;

    if (instructionIndex === instructionsWithByteIndices.length - 1) {
      nextInstructionByteIndex = instructionBytes.length;
    } else {
      nextInstructionByteIndex = instructionsWithByteIndices[instructionIndex + 1][0];
    }

    const byteStrings = new Array<string>(nextInstructionByteIndex - byteIndex);
    for (
      let byteIndexOffset = 0;
      byteIndex + byteIndexOffset < nextInstructionByteIndex;
      byteIndexOffset++
    ) {
      byteStrings[byteIndexOffset] = toByteString(instructionBytes[byteIndex + byteIndexOffset]);
    }

    strings[stringsIndex] = byteStrings.join('  |  ');

    stringsIndex++;

    strings[stringsIndex] = printInstruction(instruction) + '\n';

    stringsIndex++;
    instructionIndex++;
  }

  return strings.join('\n');
}

function printInstruction(instruction: DecodedInstruction): string {
  // Order is first appearance in decoder switch (i.e. earliest byte that encodes the instruction)
  switch (instruction.kind) {
    case 'addRegisterMemoryWithRegisterToEither': {
      return printOpDestSourceInstruction('add', instruction);
    }

    case 'addImmediateToAccumulator': {
      return `add ${instruction.dest.register}, ${instruction.data}`;
    }

    case 'pushSegmentRegister': {
      return `push ${instruction.register}`;
    }

    case 'popSegmentRegister': {
      return `pop ${instruction.register}`;
    }

    case 'orRegisterMemoryAndRegisterToEither': {
      return printOpDestSourceInstruction('or', instruction);
    }

    case 'orImmediateToAccumulator': {
      return `or ${instruction.dest.register}, ${instruction.data}`;
    }

    case 'adcRegisterMemoryWithRegisterToEither': {
      return printOpDestSourceInstruction('adc', instruction);
    }

    case 'adcImmediateToAccumulator': {
      return `adc ${instruction.dest.register}, ${instruction.data}`;
    }

    case 'sbbRegisterMemoryAndRegisterToEither': {
      return printOpDestSourceInstruction('sbb', instruction);
    }

    case 'sbbImmediateFromAccumulator': {
      return `sbb ${instruction.dest.register}, ${instruction.data}`;
    }

    case 'andRegisterMemoryWithRegisterToEither': {
      return printOpDestSourceInstruction('and', instruction);
    }

    case 'andImmediateToAccumulator': {
      return `and ${instruction.dest.register}, ${instruction.data}`;
    }

    case 'decimalAdjustForAdd': {
      return `daa`;
    }

    case 'subRegisterMemoryAndRegisterToEither': {
      return printOpDestSourceInstruction('sub', instruction);
    }

    case 'subImmediateFromAccumulator': {
      return `sub ${instruction.dest.register}, ${instruction.data}`;
    }

    case 'decimalAdjustForSubtract': {
      return 'das';
    }

    case 'xorRegisterMemoryAndRegisterToEither': {
      return printOpDestSourceInstruction('xor', instruction);
    }

    case 'xorImmediateToAccumulator': {
      return `xor ${instruction.dest.register}, ${instruction.data}`;
    }

    case 'asciiAdjustForAdd': {
      return 'aaa';
    }

    case 'cmpRegisterMemoryAndRegister': {
      return printOpDestSourceInstruction('cmp', instruction);
    }

    case 'cmpImmediateWithAccumulator': {
      return `cmp ${instruction.dest.register}, ${instruction.data}`;
    }

    case 'asciiAdjustForSubtract': {
      return 'aas';
    }

    case 'incRegister': {
      return `inc ${instruction.register.register}`;
    }

    case 'decRegister': {
      return `dec ${instruction.register.register}`;
    }

    case 'pushRegister': {
      return `push ${instruction.register.register}`;
    }

    case 'popRegister': {
      return `pop ${instruction.register.register}`;
    }

    case 'jumpOnOverflow': {
      return `jo ${instruction.signedIncrement}`;
    }

    case 'jumpOnNotOverflow': {
      return `jno ${instruction.signedIncrement}`;
    }

    case 'jumpOnBelow': {
      return `jb ${instruction.signedIncrement}`;
    }

    case 'jumpOnNotBelow': {
      return `jnb ${instruction.signedIncrement}`;
    }

    case 'jumpOnEqual': {
      return `je ${instruction.signedIncrement}`;
    }

    case 'jumpOnNotEqual': {
      return `jne ${instruction.signedIncrement}`;
    }

    case 'jumpOnNotAbove': {
      return `jna ${instruction.signedIncrement}`;
    }

    case 'jumpOnAbove': {
      return `ja ${instruction.signedIncrement}`;
    }

    case 'jumpOnSign': {
      return `js ${instruction.signedIncrement}`;
    }

    case 'jumpOnNotSign': {
      return `jns ${instruction.signedIncrement}`;
    }

    case 'jumpOnParity': {
      return `jp ${instruction.signedIncrement}`;
    }

    case 'jumpOnNotParity': {
      return `jnp ${instruction.signedIncrement}`;
    }

    case 'jumpOnLess': {
      return `jl ${instruction.signedIncrement}`;
    }

    case 'jumpOnNotLess': {
      return `jnl ${instruction.signedIncrement}`;
    }

    case 'jumpOnNotGreater': {
      return `jng ${instruction.signedIncrement}`;
    }

    case 'jumpOnGreater': {
      return `jg ${instruction.signedIncrement}`;
    }

    case 'addImmediateToRegisterMemory': {
      return printOpDestSizedDataInstruction('add', instruction);
    }

    case 'orImmediateToRegisterMemory': {
      return printOpDestSizedDataInstruction('or', instruction);
    }

    case 'adcImmediateToRegisterMemory': {
      return printOpDestSizedDataInstruction('adc', instruction);
    }

    case 'sbbImmediateToRegisterMemory': {
      return printOpDestSizedDataInstruction('sbb', instruction);
    }

    case 'andImmediateToRegisterMemory': {
      return printOpDestSizedDataInstruction('and', instruction);
    }

    case 'subImmediateToRegisterMemory': {
      return printOpDestSizedDataInstruction('sub', instruction);
    }

    case 'xorImmediateToRegisterMemory': {
      return printOpDestSizedDataInstruction('xor', instruction);
    }

    case 'cmpImmediateToRegisterMemory': {
      return printOpDestSizedDataInstruction('cmp', instruction);
    }

    case 'movRegisterMemoryToFromRegister':
    case 'movMemoryToFromAccumulator': {
      return printOpDestSourceInstruction('mov', instruction);
    }

    case 'movImmediateToRegister': {
      return `mov ${instruction.dest.register}, ${instruction.data}`;
    }

    case 'movImmediateToRegisterMemory': {
      return printOpDestSizedDataInstruction('mov', instruction);
    }

    case 'NOT USED': {
      return `(not used) ${toByteString(instruction.byte)}`;
    }

    case 'UNKNOWN':
      return `UNKNOWN`;
  }
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

function printOpDestSizedDataInstruction(
  op: string,
  instruction: { dest: RegisterOrEac; data: number },
): string {
  const destString = printRegisterOrEac(instruction.dest);

  let dataString: string;
  if (instruction.dest.kind === 'reg') {
    dataString = instruction.data.toString();
  } else {
    dataString = printDataWithSize(instruction.data);
  }

  return `${op} ${destString}, ${dataString}`;
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

const zeroString = '0';

// Lazy implementation
function toByteString(positiveU8Byte: number): string {
  const bigNibble = (positiveU8Byte & 0b1111_0000) >> 4;
  const smallNibble = positiveU8Byte & 0b0000_1111;

  return `${bigNibble.toString(2).padStart(4, zeroString)} ${smallNibble
    .toString(2)
    .padStart(4, zeroString)}`;
}
