import { DecodedInstruction, DecodedInstructionWithByteIndex, Operand } from './decoder';

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

// Order is first appearance in decoder switch (i.e. earliest byte that encodes the instruction)
const mnemonicsTable = {
  addRegisterMemoryWithRegisterToEither: 'add',
  addImmediateToAccumulator: 'add',
  pushSegmentRegister: 'push',
  popSegmentRegister: 'pop',
  orRegisterMemoryAndRegisterToEither: 'or',
  orImmediateToAccumulator: 'or',
  adcRegisterMemoryWithRegisterToEither: 'adc',
  adcImmediateToAccumulator: 'adc',
  sbbRegisterMemoryAndRegisterToEither: 'sbb',
  sbbImmediateFromAccumulator: 'sbb',
  andRegisterMemoryWithRegisterToEither: 'and',
  andImmediateToAccumulator: 'and',
  daaDecimalAdjustForAdd: 'daa',
  subRegisterMemoryAndRegisterToEither: 'sub',
  subImmediateFromAccumulator: 'sub',
  dasDecimalAdjustForSubtract: 'das',
  xorRegisterMemoryAndRegisterToEither: 'xor',
  xorImmediateToAccumulator: 'xor',
  aaaAsciiAdjustForAdd: 'aaa',
  cmpRegisterMemoryAndRegister: 'cmp',
  cmpImmediateWithAccumulator: 'cmp',
  aasAsciiAdjustForSubtract: 'aas',
  incRegister: 'inc',
  decRegister: 'dec',
  pushRegister: 'push',
  popRegister: 'pop',
  joJumpOnOverflow: 'jo',
  jnoJumpOnNotOverflow: 'jno',
  jbJumpOnBelow: 'jb',
  jnbJumpOnNotBelow: 'jnb',
  jeJumpOnEqual: 'je',
  jneJumpOnNotEqual: 'jne',
  jnaJumpOnNotAbove: 'jna',
  jaJumpOnAbove: 'ja',
  jsJumpOnSign: 'js',
  jnsJumpOnNotSign: 'jns',
  jpJumpOnParity: 'jp',
  jnpJumpOnNotParity: 'jnp',
  jlJumpOnLess: 'jl',
  jnlJumpOnNotLess: 'jnl',
  jngJumpOnNotGreater: 'jng',
  jgJumpOnGreater: 'jg',
  addImmediateToRegisterMemory: 'add',
  orImmediateToRegisterMemory: 'or',
  adcImmediateToRegisterMemory: 'adc',
  sbbImmediateToRegisterMemory: 'sbb',
  andImmediateToRegisterMemory: 'and',
  subImmediateToRegisterMemory: 'sub',
  xorImmediateToRegisterMemory: 'xor',
  cmpImmediateToRegisterMemory: 'cmp',
  testRegisterMemoryAndRegister: 'test',
  xchgRegisterMemoryWithRegister: 'xchg',
  movRegisterMemoryToFromRegister: 'mov',
  movSegmentRegisterToRegisterMemory: 'mov',
  leaLoadEaToRegister: 'lea',
  movRegisterMemoryToSegmentRegister: 'mov',
  popRegisterMemory: 'pop',
  xchgRegisterWithAccumulator: 'xchg',
  cbwConvertByteToWord: 'cbw',
  cwdConvertWordToDoubleWord: 'cwd',
  callDirectIntersegment: 'call',
  wait: 'wait',
  pushfPushFlags: 'pushf',
  popfPopFlags: 'popf',
  sahfStoreAhIntoFlags: 'sahf',
  lahfLoadAhWithFlags: 'lahf',
  movMemoryToFromAccumulator: 'mov',
  movsMoveByteWord: 'movs',
  cmpsCompareByteWord: 'cmps',
  testImmediateWithAccumulator: 'test',
  stosStoreByteWordFromAlAx: 'stos',
  lodsLoadByteWordFromAlAx: 'lods',
  scasScanByteWord: 'scas',
  movImmediateToRegister: 'mov',
  retWithinSegAddingImmedToSp: 'ret',
  retWithinSegment: 'ret',
  lesLoadPointerToEs: 'les',
  ldsLoadPointerToDs: 'lds',
  movImmediateToRegisterMemory: 'mov',
  retIntersegmentAddingImmediateToSp: 'ret',
  retIntersegment: 'ret',
  intType3: 'int3',
  intTypeSpecified: 'int',
  intoInterruptOnOverflow: 'into',
  iretInterruptReturn: 'iret',
  rolRotateLeft: 'rol',
  rorRotateRight: 'ror',
  rclRotateThroughCarryFlagLeft: 'rcl',
  rcrRotateThroughCarryRight: 'rcr',
  salShiftLogicalArithmeticLeft: 'sal',
  shrShiftLogicalRight: 'shr',
  sarShiftArithmeticRight: 'sar',
  aamAsciiAdjustForMultiply: 'aam',
  aadAsciiAdjustForDivide: 'aad',
  xlatTranslateByteToAl: 'xlat',
  escEscapeToExternalDevice: 'esc',
  loopneLoopWhileNotEqual: 'loopne',
  loopeLoopWhileEqual: 'loope',
  loopLoopCxTimes: 'loop',
  jcxzJumpOnCxZero: 'jcxz',
  inFixedPort: 'in',
  outFixedPort: 'out',
  callDirectWithinSegment: 'call',
  jmpDirectWithinSegment: 'jmp',
  jmpDirectIntersegment: 'jmp',
  jmpDirectWithinSegmentShort: 'jmp',
  inVariablePort: 'in',
  outVariablePortInstruction: 'out',
  hltHalt: 'hlt',
  cmcComplementCarry: 'cmc',
  testImmediateDataAndRegisterMemory: 'test',
  notInvert: 'not',
  negChangeSign: 'neg',
  mulMultipleUnsigned: 'mul',
  imulIntegerMultiplySigned: 'imul',
  divDivideUnsigned: 'div',
  idivIntegerDivideSigned: 'idiv',
  clcClearCarry: 'clc',
  stcSetCarry: 'stc',
  cliClearInterrupt: 'cli',
  stiSetInterrupt: 'sti',
  cldClearDirection: 'cld',
  stdSetDirection: 'std',
  incRegisterMemory: 'inc',
  decRegisterMemory: 'dec',
  callIndirectWithinSegment: 'call',
  callIndirectIntersegment: 'call',
  jmpIndirectWithinSegment: 'jmp',
  jmpIndirectIntersegment: 'jmp',
  pushRegisterMemory: 'push',
  'NOT USED': 'NOT USED',
  UNKNOWN: 'UNKNOWN',
} satisfies Readonly<Record<DecodedInstruction['kind'], string>>;

function printInstruction(instruction: DecodedInstruction): string {
  if (
    instruction.kind === 'callDirectIntersegment' ||
    instruction.kind === 'jmpDirectIntersegment'
  ) {
    // These have special syntax because why not
    return `${mnemonicsTable[instruction.kind]} ${instruction.op1}:${instruction.op2}`;
  }

  const lockPrefix = 'lock' in instruction && instruction.lock ? 'lock ' : '';

  const repPrefix = 'rep' in instruction && instruction.rep !== null ? instruction.rep : '';

  const mnemonic = mnemonicsTable[instruction.kind];

  const wbSuffix = 'word' in instruction ? (instruction.word ? 'w' : 'b') : '';

  const op1 = 'op1' in instruction ? ` ${printOperand(instruction.op1)}` : '';

  const op2 = 'op2' in instruction ? `, ${printOperand(instruction.op2)}` : '';

  return `${lockPrefix}${repPrefix}${mnemonic}${wbSuffix}${op1}${op2}`;
}

function printOperand(operand: Operand): string {
  if (typeof operand === 'string') {
    return operand;
  } else if (typeof operand === 'number') {
    return operand.toString();
  } else if (operand.kind === 'reg') {
    return operand.register;
  } else {
    let lengthPrefixString: string;

    switch (operand.length) {
      case null:
        lengthPrefixString = '';
        break;
      case 1:
        lengthPrefixString = 'byte ';
        break;
      case 2:
        lengthPrefixString = 'word ';
        break;
    }

    const segmentOverridePrefixString = operand.segmentOverridePrefix
      ? `${operand.segmentOverridePrefix}: `
      : '';

    if (operand.displacement !== null && operand.displacement !== 0) {
      if (operand.text === 'DIRECT ADDRESS') {
        return `${lengthPrefixString}${segmentOverridePrefixString}[${operand.displacement}]`;
      } else {
        const signedDisplacementString = printSignedAsOperation(operand.displacement);

        return `${lengthPrefixString}${segmentOverridePrefixString}[${operand.text} ${signedDisplacementString}]`;
      }
    } else {
      return `${lengthPrefixString}${segmentOverridePrefixString}[${operand.text}]`;
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

const zeroString = '0';

// Lazy implementation
function toByteString(positiveU8Byte: number): string {
  const bigNibble = (positiveU8Byte & 0b1111_0000) >> 4;
  const smallNibble = positiveU8Byte & 0b0000_1111;

  return `${bigNibble.toString(2).padStart(4, zeroString)} ${smallNibble
    .toString(2)
    .padStart(4, zeroString)}`;
}
