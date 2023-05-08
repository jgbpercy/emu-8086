import {
  DecodedInstruction,
  DecodedInstructionWithByteIndex,
  EffectiveAddressCalculation,
  Operand,
} from './decoder';

const bitsDirective = 'bits 16';

export interface PrinterSettings {
  readonly mnemonicCaps?: boolean;
  readonly registerCaps?: boolean;
  readonly keywordCaps?: boolean;
  readonly spaceBetweenOperands?: boolean;
  readonly spacesInAddressCalculation?: boolean;
  readonly spaceAfterSegmentOverridePrefix?: boolean;
  readonly annotateBytes?:
    | false
    | {
        readonly position: 'above' | 'after';
        readonly format: 'binary' | 'decimal' | 'hex';
      };
}

const defaultSettings: Required<PrinterSettings> = {
  mnemonicCaps: false,
  registerCaps: false,
  keywordCaps: false,
  spaceBetweenOperands: true,
  spacesInAddressCalculation: true,
  spaceAfterSegmentOverridePrefix: true,
  annotateBytes: false,
};

export function printDecodedInstructions(
  instructionsWithByteIndices: ReadonlyArray<DecodedInstructionWithByteIndex>,
  instructionBytes: Uint8Array,
  _settings?: PrinterSettings,
): string {
  const settings: Required<PrinterSettings> = { ...defaultSettings, ..._settings };

  const strings = new Array<string>(instructionsWithByteIndices.length + 1);

  strings[0] = settings.keywordCaps ? bitsDirective.toUpperCase() : bitsDirective;

  let instructionIndex = 0;
  let stringIndex = 1;

  for (const [byteIndex, instruction] of instructionsWithByteIndices) {
    const instructionString = printInstruction(instruction, settings);

    if (!settings.annotateBytes) {
      strings[stringIndex] = instructionString;
    } else {
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
        const byte = instructionBytes[byteIndex + byteIndexOffset];
        switch (settings.annotateBytes.format) {
          case 'binary':
            byteStrings[byteIndexOffset] = toByteString(byte);
            break;
          case 'hex':
            byteStrings[byteIndexOffset] = byte.toString(16);
            break;
          case 'decimal':
            byteStrings[byteIndexOffset] = byte.toString(10);
            break;
        }
      }

      const annotation =
        settings.annotateBytes.format === 'binary'
          ? byteStrings.join('  |  ')
          : byteStrings.join(' ');

      switch (settings.annotateBytes.position) {
        case 'above':
          strings[stringIndex] = `; ${annotation}\n${instructionString}`;
          break;
        case 'after':
          strings[stringIndex] = `${instructionString} ; ${annotation}`;
          break;
      }
    }

    stringIndex++;
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
  movMemoryToAccumulator: 'mov',
  movAccumulatorToMemory: 'mov',
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

const mnemonicsTableUpper = mapValuesToUpper(mnemonicsTable);

type EacStringTable = Readonly<
  Record<Exclude<EffectiveAddressCalculation['calculationKind'], 'DIRECT ADDRESS'>, string>
>;

const eacStringTable = {
  bp: 'bp',
  bx: 'bx',
  di: 'di',
  si: 'si',
  'bp + di': 'bp + di',
  'bp + si': 'bp + si',
  'bx + di': 'bx + di',
  'bx + si': 'bx + si',
} satisfies EacStringTable;

const eacStringTableNoSpaces = {
  bp: 'bp',
  bx: 'bx',
  di: 'di',
  si: 'si',
  'bp + di': 'bp+di',
  'bp + si': 'bp+si',
  'bx + di': 'bx+di',
  'bx + si': 'bx+si',
} satisfies EacStringTable;

const eacStringTableUpper = mapValuesToUpper(eacStringTable);

const eacStringTableUpperNoSpaces = mapValuesToUpper(eacStringTableNoSpaces);

// Make copy of a table but with upper case vals (type hackery be here!)
function mapValuesToUpper<T extends Readonly<Record<string, string>>>(original: T): T {
  const copy = Object.fromEntries(
    Object.keys(original).map((key) => [key, original[key as keyof typeof original].toUpperCase()]),
  ) as typeof original;

  return copy;
}

export function printDecodedInstruction(
  instruction: DecodedInstruction,
  settings?: PrinterSettings,
): string {
  return printInstruction(instruction, { ...defaultSettings, ...settings });
}

function printInstruction(
  instruction: DecodedInstruction,
  settings: Required<PrinterSettings>,
): string {
  if (
    instruction.kind === 'callDirectIntersegment' ||
    instruction.kind === 'jmpDirectIntersegment'
  ) {
    // These have special syntax because why not
    return `${mnemonicsTable[instruction.kind]} ${instruction.op1}:${instruction.op2}`;
  }

  let lockPrefix: string;
  if ('lock' in instruction && instruction.lock) {
    if (settings.mnemonicCaps) {
      lockPrefix = 'LOCK ';
    } else {
      lockPrefix = 'lock ';
    }
  } else {
    lockPrefix = '';
  }

  let repPrefix: string;
  if ('rep' in instruction && instruction.rep !== null) {
    if (settings.mnemonicCaps) {
      repPrefix = instruction.rep.toUpperCase();
    } else {
      repPrefix = instruction.rep;
    }
  } else {
    repPrefix = '';
  }

  const mnemonic = settings.mnemonicCaps
    ? mnemonicsTableUpper[instruction.kind]
    : mnemonicsTable[instruction.kind];

  let wbSuffix: string;
  if ('word' in instruction) {
    if (settings.mnemonicCaps) {
      wbSuffix = instruction.word ? 'W' : 'B';
    } else {
      wbSuffix = instruction.word ? 'w' : 'b';
    }
  } else {
    wbSuffix = '';
  }

  let op1: string;
  if ('op1' in instruction) {
    op1 = ` ${printOperand(instruction.op1, settings)}`;
  } else {
    op1 = '';
  }

  let op2: string;
  if ('op2' in instruction) {
    const op2Itself = printOperand(instruction.op2, settings);

    if (settings.spaceBetweenOperands) {
      op2 = `, ${op2Itself}`;
    } else {
      op2 = `,${op2Itself}`;
    }
  } else {
    op2 = '';
  }

  return `${lockPrefix}${repPrefix}${mnemonic}${wbSuffix}${op1}${op2}`;
}

function printOperand(operand: Operand, settings: Required<PrinterSettings>): string {
  if (typeof operand === 'string') {
    return settings.registerCaps ? operand.toUpperCase() : operand;
  } else if (typeof operand === 'number') {
    return operand.toString();
  } else if (operand.kind === 'reg') {
    return settings.registerCaps ? operand.name.toUpperCase() : operand.name;
  } else {
    let lengthPrefixString: string;

    switch (operand.length) {
      case null:
        lengthPrefixString = '';
        break;
      case 1:
        lengthPrefixString = settings.keywordCaps ? 'BYTE ' : 'byte ';
        break;
      case 2:
        lengthPrefixString = settings.keywordCaps ? 'WORD ' : 'word ';
        break;
    }

    let segmentOverridePrefixString: string;
    if (operand.segmentOverridePrefix) {
      if (settings.registerCaps) {
        const segmentOverridePrefixUpper = operand.segmentOverridePrefix.toUpperCase();
        if (settings.spaceAfterSegmentOverridePrefix) {
          segmentOverridePrefixString = `${segmentOverridePrefixUpper}: `;
        } else {
          segmentOverridePrefixString = `${segmentOverridePrefixUpper}:`;
        }
      } else {
        if (settings.spaceAfterSegmentOverridePrefix) {
          segmentOverridePrefixString = `${operand.segmentOverridePrefix}: `;
        } else {
          segmentOverridePrefixString = `${operand.segmentOverridePrefix}:`;
        }
      }
    } else {
      segmentOverridePrefixString = '';
    }

    if (operand.calculationKind === 'DIRECT ADDRESS') {
      return `${lengthPrefixString}${segmentOverridePrefixString}[${operand.displacement ?? 0}]`;
    }

    let calculationString: string;
    if (settings.spacesInAddressCalculation) {
      if (settings.registerCaps) {
        calculationString = eacStringTableUpper[operand.calculationKind];
      } else {
        calculationString = eacStringTable[operand.calculationKind];
      }
    } else {
      if (settings.registerCaps) {
        calculationString = eacStringTableUpperNoSpaces[operand.calculationKind];
      } else {
        calculationString = eacStringTableNoSpaces[operand.calculationKind];
      }
    }

    let displacementString: string;
    if (operand.displacement !== null && operand.displacement !== 0) {
      displacementString = printSignedAsOperation(
        operand.displacement,
        settings.spacesInAddressCalculation,
      );
    } else {
      displacementString = '';
    }

    return `${lengthPrefixString}${segmentOverridePrefixString}[${calculationString}${displacementString}]`;
  }
}

function printSignedAsOperation(val: number, spaces: boolean): string {
  if (val >= 0) {
    return spaces ? ` + ${val}` : `+${val}`;
  } else {
    return spaces ? ` - ${Math.abs(val)}` : `-${Math.abs(val)}`;
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
