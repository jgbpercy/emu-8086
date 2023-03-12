export interface AddRegisterMemoryWithRegisterToEitherInstruction {
  readonly kind: 'addRegisterMemoryWithRegisterToEither';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
}

export interface AddImmediateToAccumulatorInstruction {
  readonly kind: 'addImmediateToAccumulator';
  readonly dest: AccumulatorRegister;
  readonly data: number;
}

export interface PushSegmentRegisterInstruction {
  readonly kind: 'pushSegmentRegister';
  readonly register: SegmentRegister;
}

export interface PopSegmentRegisterInstructions {
  readonly kind: 'popSegmentRegister';
  readonly register: Exclude<SegmentRegister, 'cs'>;
}

export interface OrRegisterMemoryAndRegisterToEitherInstruction {
  readonly kind: 'orRegisterMemoryAndRegisterToEither';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
}

export interface OrImmediateToAccumulatorInstruction {
  readonly kind: 'orImmediateToAccumulator';
  readonly dest: AccumulatorRegister;
  readonly data: number;
}

export interface AdcRegisterMemoryWithRegisterToEitherInstruction {
  readonly kind: 'adcRegisterMemoryWithRegisterToEither';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
}

export interface AdcImmediateToAccumulatorInstruction {
  readonly kind: 'adcImmediateToAccumulator';
  readonly dest: AccumulatorRegister;
  readonly data: number;
}

export interface SbbRegisterMemoryAndRegisterToEitherInstruction {
  readonly kind: 'sbbRegisterMemoryAndRegisterToEither';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
}

export interface SbbImmediateFromAccumulatorInstruction {
  readonly kind: 'sbbImmediateFromAccumulator';
  readonly dest: AccumulatorRegister;
  readonly data: number;
}

export interface AndRegisterMemoryWithRegisterToEitherInstruction {
  readonly kind: 'andRegisterMemoryWithRegisterToEither';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
}

export interface AndImmediateToAccumulatorInstruction {
  readonly kind: 'andImmediateToAccumulator';
  readonly dest: AccumulatorRegister;
  readonly data: number;
}

export interface DecimalAdjustForAddInstruction {
  readonly kind: 'decimalAdjustForAdd';
}

export interface SubRegisterMemoryAndRegisterToEitherInstruction {
  readonly kind: 'subRegisterMemoryAndRegisterToEither';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
}

export interface SubImmediateFromAccumulatorInstruction {
  readonly kind: 'subImmediateFromAccumulator';
  readonly dest: AccumulatorRegister;
  readonly data: number;
}

export interface DecimalAdjustForSubtractInstruction {
  readonly kind: 'decimalAdjustForSubtract';
}

export interface XorRegisterMemoryAndRegisterToEitherInstruction {
  readonly kind: 'xorRegisterMemoryAndRegisterToEither';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
}

export interface XorImmediateToAccumulatorInstruction {
  readonly kind: 'xorImmediateToAccumulator';
  readonly dest: AccumulatorRegister;
  readonly data: number;
}

export interface AsciiAdjustForAddInstruction {
  readonly kind: 'asciiAdjustForAdd';
}

export interface CmpRegisterMemoryAndRegisterInstruction {
  readonly kind: 'cmpRegisterMemoryAndRegister';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
}

export interface CmpImmediateWithAccumulatorInstruction {
  readonly kind: 'cmpImmediateWithAccumulator';
  readonly dest: AccumulatorRegister;
  readonly data: number;
}

export interface AsciiAdjustForSubtractInstruction {
  readonly kind: 'asciiAdjustForSubtract';
}

export interface IncRegisterInstruction {
  readonly kind: 'incRegister';
  readonly register: WordRegister;
}

export interface DecRegisterInstruction {
  readonly kind: 'decRegister';
  readonly register: WordRegister;
}

export interface PushRegisterInstruction {
  readonly kind: 'pushRegister';
  readonly register: WordRegister;
}

export interface PopRegisterInstruction {
  readonly kind: 'popRegister';
  readonly register: WordRegister;
}

export interface JumpOnOverflowInstruction {
  readonly kind: 'jumpOnOverflow';
  readonly signedIncrement: number;
}

export interface JumpOnNotOverflowInstruction {
  readonly kind: 'jumpOnNotOverflow';
  readonly signedIncrement: number;
}

export interface JumpOnBelowInstruction {
  readonly kind: 'jumpOnBelow';
  readonly signedIncrement: number;
}

export interface JumpOnNotBelowInstruction {
  readonly kind: 'jumpOnNotBelow';
  readonly signedIncrement: number;
}

export interface JumpOnEqualInstruction {
  readonly kind: 'jumpOnEqual';
  readonly signedIncrement: number;
}

export interface JumpOnNotEqualInstruction {
  readonly kind: 'jumpOnNotEqual';
  readonly signedIncrement: number;
}

export interface JumpOnNotAboveInstruction {
  readonly kind: 'jumpOnNotAbove';
  readonly signedIncrement: number;
}

export interface JumpOnAboveInstruction {
  readonly kind: 'jumpOnAbove';
  readonly signedIncrement: number;
}

export interface JumpOnSignInstruction {
  readonly kind: 'jumpOnSign';
  readonly signedIncrement: number;
}

export interface JumpOnNotSignInstruction {
  readonly kind: 'jumpOnNotSign';
  readonly signedIncrement: number;
}

export interface JumpOnParityInstruction {
  readonly kind: 'jumpOnParity';
  readonly signedIncrement: number;
}

export interface JumpOnNotParityInstruction {
  readonly kind: 'jumpOnNotParity';
  readonly signedIncrement: number;
}

export interface JumpOnLessInstruction {
  readonly kind: 'jumpOnLess';
  readonly signedIncrement: number;
}

export interface JumpOnNotLessInstruction {
  readonly kind: 'jumpOnNotLess';
  readonly signedIncrement: number;
}

export interface JumpOnNotGreaterInstruction {
  readonly kind: 'jumpOnNotGreater';
  readonly signedIncrement: number;
}

export interface JumpOnGreaterInstruction {
  readonly kind: 'jumpOnGreater';
  readonly signedIncrement: number;
}

export interface AddImmediateToRegisterMemoryInstruction {
  readonly kind: 'addImmediateToRegisterMemory';
  readonly dest: RegisterOrEac;
  readonly data: number;
}

export interface OrImmediateToRegisterMemoryInstruction {
  readonly kind: 'orImmediateToRegisterMemory';
  readonly dest: RegisterOrEac;
  readonly data: number;
}

export interface AdcImmediateToRegisterMemoryInstruction {
  readonly kind: 'adcImmediateToRegisterMemory';
  readonly dest: RegisterOrEac;
  readonly data: number;
}

export interface SbbImmediateToRegisterMemoryInstruction {
  readonly kind: 'sbbImmediateToRegisterMemory';
  readonly dest: RegisterOrEac;
  readonly data: number;
}

export interface AndImmediateToRegisterMemoryInstruction {
  readonly kind: 'andImmediateToRegisterMemory';
  readonly dest: RegisterOrEac;
  readonly data: number;
}

export interface SubImmediateToRegisterMemoryInstruction {
  readonly kind: 'subImmediateToRegisterMemory';
  readonly dest: RegisterOrEac;
  readonly data: number;
}

export interface XorImmediateToRegisterMemoryInstruction {
  readonly kind: 'xorImmediateToRegisterMemory';
  readonly dest: RegisterOrEac;
  readonly data: number;
}

export interface CmpImmediateToRegisterMemoryInstruction {
  readonly kind: 'cmpImmediateToRegisterMemory';
  readonly dest: RegisterOrEac;
  readonly data: number;
}

export interface MovRegisterMemoryToFromRegisterInstruction {
  readonly kind: 'movRegisterMemoryToFromRegister';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
}

export interface MovImmediateToRegisterMemoryInstruction {
  readonly kind: 'movImmediateToRegisterMemory';
  readonly dest: RegisterOrEac;
  readonly data: number;
}

export interface MovImmediateToRegisterInstruction {
  readonly kind: 'movImmediateToRegister';
  readonly dest: Register;
  readonly data: number;
}

export interface MovMemoryToFromAccumulatorInstruction {
  readonly kind: 'movMemoryToFromAccumulator';
  readonly dest:
    | AccumulatorRegister
    | { kind: 'mem'; text: 'DIRECT ADDRESS'; displacement: number };
  readonly source:
    | AccumulatorRegister
    | { kind: 'mem'; text: 'DIRECT ADDRESS'; displacement: number };
}

export interface UnknownInstruction {
  readonly kind: 'UNKNOWN';
}

export interface NotUsedInstruction {
  readonly kind: 'NOT USED';
  readonly byte: number;
}

type ShortLabelJumpInstruction =
  | JumpOnOverflowInstruction
  | JumpOnNotOverflowInstruction
  | JumpOnBelowInstruction
  | JumpOnNotBelowInstruction
  | JumpOnEqualInstruction
  | JumpOnNotEqualInstruction
  | JumpOnNotAboveInstruction
  | JumpOnAboveInstruction
  | JumpOnSignInstruction
  | JumpOnNotSignInstruction
  | JumpOnParityInstruction
  | JumpOnNotParityInstruction
  | JumpOnLessInstruction
  | JumpOnNotLessInstruction
  | JumpOnNotGreaterInstruction
  | JumpOnGreaterInstruction;

type StandardArithmeticLogicImmediateToRegisterMemoryInstruction =
  | AddImmediateToRegisterMemoryInstruction
  | OrImmediateToRegisterMemoryInstruction
  | AdcImmediateToRegisterMemoryInstruction
  | SbbImmediateToRegisterMemoryInstruction
  | AndImmediateToRegisterMemoryInstruction
  | SubImmediateToRegisterMemoryInstruction
  | XorImmediateToRegisterMemoryInstruction
  | CmpImmediateToRegisterMemoryInstruction;

export type DecodedInstruction =
  | AddRegisterMemoryWithRegisterToEitherInstruction
  | AddImmediateToAccumulatorInstruction
  | PushSegmentRegisterInstruction
  | PopSegmentRegisterInstructions
  | OrRegisterMemoryAndRegisterToEitherInstruction
  | OrImmediateToAccumulatorInstruction
  | AdcRegisterMemoryWithRegisterToEitherInstruction
  | AdcImmediateToAccumulatorInstruction
  | SbbRegisterMemoryAndRegisterToEitherInstruction
  | SbbImmediateFromAccumulatorInstruction
  | AndRegisterMemoryWithRegisterToEitherInstruction
  | AndImmediateToAccumulatorInstruction
  | DecimalAdjustForAddInstruction
  | SubRegisterMemoryAndRegisterToEitherInstruction
  | SubImmediateFromAccumulatorInstruction
  | DecimalAdjustForSubtractInstruction
  | XorRegisterMemoryAndRegisterToEitherInstruction
  | XorImmediateToAccumulatorInstruction
  | AsciiAdjustForAddInstruction
  | CmpRegisterMemoryAndRegisterInstruction
  | CmpImmediateWithAccumulatorInstruction
  | AsciiAdjustForSubtractInstruction
  | IncRegisterInstruction
  | DecRegisterInstruction
  | PushRegisterInstruction
  | PopRegisterInstruction
  | ShortLabelJumpInstruction
  | StandardArithmeticLogicImmediateToRegisterMemoryInstruction
  | MovRegisterMemoryToFromRegisterInstruction
  | MovImmediateToRegisterMemoryInstruction
  | MovImmediateToRegisterInstruction
  | MovMemoryToFromAccumulatorInstruction
  | NotUsedInstruction
  | UnknownInstruction;

type _Register =
  | 'al'
  | 'bl'
  | 'cl'
  | 'dl'
  | 'ah'
  | 'bh'
  | 'ch'
  | 'dh'
  | 'ax'
  | 'bx'
  | 'cx'
  | 'dx'
  | 'sp'
  | 'bp'
  | 'si'
  | 'di';

interface Register {
  kind: 'reg';
  register: _Register;
}

type AccumulatorRegister = typeof alReg | typeof axReg;

type WordRegister =
  | typeof axReg
  | typeof bxReg
  | typeof cxReg
  | typeof dxReg
  | typeof spReg
  | typeof bpReg
  | typeof siReg
  | typeof diReg;

type _EffectiveAddressCalculationCategory =
  | { kind: 'eac'; text: 'bx + si'; displacementBytes: 0 | 1 | 2 }
  | { kind: 'eac'; text: 'bx + di'; displacementBytes: 0 | 1 | 2 }
  | { kind: 'eac'; text: 'bp + si'; displacementBytes: 0 | 1 | 2 }
  | { kind: 'eac'; text: 'bp + di'; displacementBytes: 0 | 1 | 2 }
  | { kind: 'eac'; text: 'si'; displacementBytes: 0 | 1 | 2 }
  | { kind: 'eac'; text: 'di'; displacementBytes: 0 | 1 | 2 }
  | { kind: 'eac'; text: 'DIRECT ADDRESS'; displacementBytes: 2 }
  | { kind: 'eac'; text: 'bx'; displacementBytes: 0 | 1 | 2 }
  | { kind: 'eac'; text: 'bp'; displacementBytes: 1 | 2 };

type EffectiveAddressCalculationCategory = { kind: 'eac' } & _EffectiveAddressCalculationCategory;

type SegmentRegister = 'es' | 'cs' | 'ss' | 'ds';

export type RegisterOrEacCategory = Register | EffectiveAddressCalculationCategory;

export interface EffectiveAddressCalculation {
  readonly kind: 'mem';
  readonly text: EffectiveAddressCalculationCategory['text'];
  readonly displacement: number | null;
  readonly segmentOverridePrefix?: SegmentRegister;
}

export type RegisterOrEac = Register | EffectiveAddressCalculation;

const alReg = { kind: 'reg', register: 'al' } as const;
const axReg = { kind: 'reg', register: 'ax' } as const;
const clReg = { kind: 'reg', register: 'cl' } as const;
const cxReg = { kind: 'reg', register: 'cx' } as const;
const dlReg = { kind: 'reg', register: 'dl' } as const;
const dxReg = { kind: 'reg', register: 'dx' } as const;
const blReg = { kind: 'reg', register: 'bl' } as const;
const bxReg = { kind: 'reg', register: 'bx' } as const;
const ahReg = { kind: 'reg', register: 'ah' } as const;
const spReg = { kind: 'reg', register: 'sp' } as const;
const chReg = { kind: 'reg', register: 'ch' } as const;
const bpReg = { kind: 'reg', register: 'bp' } as const;
const dhReg = { kind: 'reg', register: 'dh' } as const;
const siReg = { kind: 'reg', register: 'si' } as const;
const bhReg = { kind: 'reg', register: 'bh' } as const;
const diReg = { kind: 'reg', register: 'di' } as const;

// table 4-9
const regTable: ReadonlyArray<Register> = [
  // reg 000 w 0
  alReg,
  // reg 000 w 1
  axReg,
  // reg 001 w 0
  clReg,
  // reg 001 w 1
  cxReg,
  // reg 010 w 0
  dlReg,
  // reg 010 w 1
  dxReg,
  // reg 011 w 0
  blReg,
  // reg 011 w 1
  bxReg,
  // reg 100 w 0
  ahReg,
  // reg 100 w 1
  spReg,
  // reg 101 w 0
  chReg,
  // reg 101 w 1
  bpReg,
  // reg 110 w 0
  dhReg,
  // reg 110 w 1
  siReg,
  // reg 111 w 0
  bhReg,
  // reg 111 w 1
  diReg,
];

const wordRegisterTable: ReadonlyArray<WordRegister> = [
  // 000
  axReg,
  // 001
  cxReg,
  // 010
  dxReg,
  // 011
  bxReg,
  // 100
  spReg,
  // 101,
  bpReg,
  // 110
  siReg,
  // 111
  diReg,
];

// table 4-10
const effectiveAddressTable: Readonly<Record<number, EffectiveAddressCalculationCategory>> = {
  // mod 00, rm 000
  [0b0000_0000]: { kind: 'eac', text: 'bx + si', displacementBytes: 0 },
  // mod 00, rm 001
  [0b0000_0001]: { kind: 'eac', text: 'bx + di', displacementBytes: 0 },
  // mod 00, rm 010
  [0b0000_0010]: { kind: 'eac', text: 'bp + si', displacementBytes: 0 },
  // mod 00, rm 011
  [0b0000_0011]: { kind: 'eac', text: 'bp + di', displacementBytes: 0 },
  // mod 00, rm 100
  [0b0000_0100]: { kind: 'eac', text: 'si', displacementBytes: 0 },
  // mod 00, rm 101
  [0b0000_0101]: { kind: 'eac', text: 'di', displacementBytes: 0 },
  // mod 00, rm 110
  [0b0000_0110]: { kind: 'eac', text: 'DIRECT ADDRESS', displacementBytes: 2 },
  // mod 00, rm 111
  [0b0000_0111]: { kind: 'eac', text: 'bx', displacementBytes: 0 },
  // mod 01, rm 000
  [0b0100_0000]: { kind: 'eac', text: 'bx + si', displacementBytes: 1 },
  // mod 01, rm 001
  [0b0100_0001]: { kind: 'eac', text: 'bx + di', displacementBytes: 1 },
  // mod 01, rm 010
  [0b0100_0010]: { kind: 'eac', text: 'bp + si', displacementBytes: 1 },
  // mod 01, rm 011
  [0b0100_0011]: { kind: 'eac', text: 'bp + di', displacementBytes: 1 },
  // mod 01, rm 100
  [0b0100_0100]: { kind: 'eac', text: 'si', displacementBytes: 1 },
  // mod 01, rm 101
  [0b0100_0101]: { kind: 'eac', text: 'di', displacementBytes: 1 },
  // mod 01, rm 110
  [0b0100_0110]: { kind: 'eac', text: 'bp', displacementBytes: 1 },
  // mod 01, rm 111
  [0b0100_0111]: { kind: 'eac', text: 'bx', displacementBytes: 1 },
  // mod 10, rm 000
  [0b1000_0000]: { kind: 'eac', text: 'bx + si', displacementBytes: 2 },
  // mod 10, rm 001
  [0b1000_0001]: { kind: 'eac', text: 'bx + di', displacementBytes: 2 },
  // mod 10, rm 010
  [0b1000_0010]: { kind: 'eac', text: 'bp + si', displacementBytes: 2 },
  // mod 10, rm 011
  [0b1000_0011]: { kind: 'eac', text: 'bp + di', displacementBytes: 2 },
  // mod 10, rm 100
  [0b1000_0100]: { kind: 'eac', text: 'si', displacementBytes: 2 },
  // mod 10, rm 101
  [0b1000_0101]: { kind: 'eac', text: 'di', displacementBytes: 2 },
  // mod 10, rm 110
  [0b1000_0110]: { kind: 'eac', text: 'bp', displacementBytes: 2 },
  // mod 10, rm 111
  [0b1000_0111]: { kind: 'eac', text: 'bx', displacementBytes: 2 },
};

// 70 - 7f in table 4-13
const shortLabelJumpInstructionTable: ReadonlyArray<ShortLabelJumpInstruction['kind']> = [
  // 0000
  'jumpOnOverflow',
  // 0001
  'jumpOnNotOverflow',
  // 0010
  'jumpOnBelow',
  // 0011
  'jumpOnNotBelow',
  // 0100
  'jumpOnEqual',
  // 0101
  'jumpOnNotEqual',
  // 0110
  'jumpOnNotAbove',
  // 0111
  'jumpOnAbove',
  // 1000
  'jumpOnSign',
  // 1001
  'jumpOnNotSign',
  // 1010
  'jumpOnParity',
  // 1011
  'jumpOnNotParity',
  // 1100
  'jumpOnLess',
  // 1101
  'jumpOnNotLess',
  // 1110
  'jumpOnNotGreater',
  // 1111
  'jumpOnGreater',
];

const standardArithmeticLogicImmediateToRegisterMemoryInstructionTable: ReadonlyArray<
  StandardArithmeticLogicImmediateToRegisterMemoryInstruction['kind']
> = [
  // 000
  'addImmediateToRegisterMemory',
  // 001
  'orImmediateToRegisterMemory',
  // 010
  'adcImmediateToRegisterMemory',
  // 011
  'sbbImmediateToRegisterMemory',
  // 100
  'andImmediateToRegisterMemory',
  // 101
  'subImmediateToRegisterMemory',
  // 110
  'xorImmediateToRegisterMemory',
  // 111
  'cmpImmediateToRegisterMemory',
];

interface IndexRef {
  index: number;
}

interface SegmentOverridePrefixRef {
  segReg: SegmentRegister | undefined;
}

type InstructionBytes = Uint8Array;

export function decodeInstructions(
  instructionBytes: InstructionBytes,
): ReadonlyArray<DecodedInstruction> {
  const instructions: DecodedInstruction[] = [];
  const indexRef: IndexRef = { index: 0 };
  const segmentOverridePrefixRef: SegmentOverridePrefixRef = { segReg: undefined };

  while (indexRef.index < instructionBytes.length) {
    console.log(indexRef.index);
    instructions.push(decodeInstruction(instructionBytes, indexRef, segmentOverridePrefixRef));
  }

  return instructions;
}

export type DecodedInstructionWithByteIndex = [number, DecodedInstruction];

export function decodeInstructionsAndByteIndices(
  instructionBytes: InstructionBytes,
): ReadonlyArray<DecodedInstructionWithByteIndex> {
  const instructions: DecodedInstructionWithByteIndex[] = [];
  const indexRef: IndexRef = { index: 0 };
  const segmentOverridePrefixRef: SegmentOverridePrefixRef = { segReg: undefined };

  while (indexRef.index < instructionBytes.length) {
    instructions.push([
      indexRef.index,
      decodeInstruction(instructionBytes, indexRef, segmentOverridePrefixRef),
    ]);
  }

  return instructions;
}

function decodeInstruction(
  instructionBytes: InstructionBytes,
  indexRef: IndexRef,
  segmentOverridePrefixRef: SegmentOverridePrefixRef,
): DecodedInstruction {
  const firstByte = instructionBytes[indexRef.index];

  let instruction: DecodedInstruction;

  switch (firstByte) {
    // 00 - 03
    // add Register/memory with register to either
    // Layout 0000 00dw
    case 0b0000_0000:
    case 0b0000_0001:
    case 0b0000_0010:
    case 0b0000_0011: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(
        instructionBytes,
        indexRef,
        segmentOverridePrefixRef,
      );

      instruction = {
        kind: 'addRegisterMemoryWithRegisterToEither',
        dest,
        source,
      };

      break;
    }

    // 04 - 05
    // add Immediate to accumulator
    // Layout 0000 010w
    case 0b0000_0100:
    case 0b0000_0101: {
      const [dest, data] = decodeDestDataForImmediateToAccumulatorInstruction(
        instructionBytes,
        indexRef,
      );

      instruction = {
        kind: 'addImmediateToAccumulator',
        dest,
        data,
      };

      break;
    }

    // 06
    // push Segment register es
    case 0b0000_0110: {
      instruction = {
        kind: 'pushSegmentRegister',
        register: 'es',
      };

      break;
    }

    // 07
    // pop Segment register es
    case 0b0000_0111: {
      instruction = {
        kind: 'popSegmentRegister',
        register: 'es',
      };

      break;
    }

    // 08 - 0b
    // or Register/memory and register to either
    // Layout 0000 10dw
    case 0b0000_1000:
    case 0b0000_1001:
    case 0b0000_1010:
    case 0b0000_1011: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(
        instructionBytes,
        indexRef,
        segmentOverridePrefixRef,
      );

      instruction = {
        kind: 'orRegisterMemoryAndRegisterToEither',
        dest,
        source,
      };

      break;
    }

    // 0c - 0d
    // or Immediate to accumulator
    // Layout 0000 110w
    case 0b0000_1100:
    case 0b0000_1101: {
      const [dest, data] = decodeDestDataForImmediateToAccumulatorInstruction(
        instructionBytes,
        indexRef,
      );

      instruction = {
        kind: 'orImmediateToAccumulator',
        dest,
        data,
      };

      break;
    }

    // 0e
    // push Segment register cs
    case 0b0000_1110: {
      instruction = {
        kind: 'pushSegmentRegister',
        register: 'cs',
      };

      break;
    }

    // 0f
    // NOT USED - apparently popping cs isn't a thing
    case 0b0000_1111: {
      instruction = {
        kind: 'NOT USED',
        byte: firstByte,
      };

      break;
    }

    // 10 - 13
    // adc Register/memory with register to either
    // Layout 0001 00dw
    case 0b0001_0000:
    case 0b0001_0001:
    case 0b0001_0010:
    case 0b0001_0011: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(
        instructionBytes,
        indexRef,
        segmentOverridePrefixRef,
      );

      instruction = {
        kind: 'adcRegisterMemoryWithRegisterToEither',
        dest,
        source,
      };

      break;
    }

    // 14 - 15
    // adc Immediate to accumulator
    // Layout 0001 010w
    case 0b0001_0100:
    case 0b0001_0101: {
      const [dest, data] = decodeDestDataForImmediateToAccumulatorInstruction(
        instructionBytes,
        indexRef,
      );

      instruction = {
        kind: 'adcImmediateToAccumulator',
        dest,
        data,
      };

      break;
    }

    // 16
    // push Segment register ss
    case 0b0001_0110: {
      instruction = {
        kind: 'pushSegmentRegister',
        register: 'ss',
      };

      break;
    }

    // 17
    // pop Segment register SS
    case 0b0001_0111: {
      instruction = {
        kind: 'popSegmentRegister',
        register: 'ss',
      };

      break;
    }

    // 18 - 1b
    // sbb Register/memory and register to either
    // Layout 0001 10dw
    case 0b0001_1000:
    case 0b0001_1001:
    case 0b0001_1010:
    case 0b0001_1011: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(
        instructionBytes,
        indexRef,
        segmentOverridePrefixRef,
      );

      instruction = {
        kind: 'sbbRegisterMemoryAndRegisterToEither',
        dest,
        source,
      };

      break;
    }

    // 1c - 1d
    // sbb Immediate from accumulator
    // Layout 0001 110w
    case 0b0001_1100:
    case 0b0001_1101: {
      const [dest, data] = decodeDestDataForImmediateToAccumulatorInstruction(
        instructionBytes,
        indexRef,
      );

      instruction = {
        kind: 'sbbImmediateFromAccumulator',
        dest,
        data,
      };

      break;
    }

    // 1e
    // push Segment register ds
    case 0b0001_1110: {
      instruction = {
        kind: 'pushSegmentRegister',
        register: 'ds',
      };

      break;
    }

    // 1f
    // pop Segment register ds
    case 0b0001_1111: {
      instruction = {
        kind: 'popSegmentRegister',
        register: 'ds',
      };

      break;
    }

    // 20 - 23
    // and Register/memory with register to either
    // Layout 0010 00dw
    case 0b0010_0000:
    case 0b0010_0001:
    case 0b0010_0010:
    case 0b0010_0011: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(
        instructionBytes,
        indexRef,
        segmentOverridePrefixRef,
      );

      instruction = {
        kind: 'andRegisterMemoryWithRegisterToEither',
        dest,
        source,
      };

      break;
    }

    // 24 - 25
    // and Immediate to accumulator
    // Layout 0010 010w
    case 0b0010_0100:
    case 0b0010_0101: {
      const [dest, data] = decodeDestDataForImmediateToAccumulatorInstruction(
        instructionBytes,
        indexRef,
      );

      instruction = {
        kind: 'andImmediateToAccumulator',
        dest,
        data,
      };

      break;
    }

    // 26
    // es Segment override prefix
    // cursed: continue the loop and attach to the next instruction
    case 0b0010_0110: {
      segmentOverridePrefixRef.segReg = 'es';

      indexRef.index++;

      return decodeInstruction(instructionBytes, indexRef, segmentOverridePrefixRef);
    }

    // 27
    // daa Decimal adjust for add
    case 0b0010_0111: {
      instruction = {
        kind: 'decimalAdjustForAdd',
      };

      break;
    }

    // 28 - 2b
    // sub Register/memory and register to either
    // Layout 0010 10dw
    case 0b0010_1000:
    case 0b0010_1001:
    case 0b0010_1010:
    case 0b0010_1011: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(
        instructionBytes,
        indexRef,
        segmentOverridePrefixRef,
      );

      instruction = {
        kind: 'subRegisterMemoryAndRegisterToEither',
        dest,
        source,
      };

      break;
    }

    // 2c - 2d
    // sub Immediate from accumulator
    // Layout 0010 110w
    case 0b0010_1100:
    case 0b0010_1101: {
      const [dest, data] = decodeDestDataForImmediateToAccumulatorInstruction(
        instructionBytes,
        indexRef,
      );

      instruction = {
        kind: 'subImmediateFromAccumulator',
        dest,
        data,
      };

      break;
    }

    // 2e
    // cs Segment override prefix
    // cursed: continue the loop and attach to the next instruction
    case 0b0010_1110: {
      segmentOverridePrefixRef.segReg = 'cs';

      indexRef.index++;

      return decodeInstruction(instructionBytes, indexRef, segmentOverridePrefixRef);
    }

    // 2f
    // das Decimal adjust for subtract
    case 0b0010_1111: {
      instruction = {
        kind: 'decimalAdjustForSubtract',
      };

      break;
    }

    // 30 - 33
    // xor Register/memory and register to either
    // Layout 0011 00dw
    case 0b0011_0000:
    case 0b0011_0001:
    case 0b0011_0010:
    case 0b0011_0011: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(
        instructionBytes,
        indexRef,
        segmentOverridePrefixRef,
      );

      instruction = {
        kind: 'xorRegisterMemoryAndRegisterToEither',
        dest,
        source,
      };

      break;
    }

    // 34 - 35
    // xor Immediate to accumulator
    // Layout 0011 010w
    case 0b0011_0100:
    case 0b0011_0101: {
      const [dest, data] = decodeDestDataForImmediateToAccumulatorInstruction(
        instructionBytes,
        indexRef,
      );

      instruction = {
        kind: 'xorImmediateToAccumulator',
        dest,
        data,
      };

      break;
    }

    // 36
    // ss Segment override prefix
    // cursed: continue the loop and attach to the next instruction
    case 0b0011_0110: {
      segmentOverridePrefixRef.segReg = 'ss';

      indexRef.index++;

      return decodeInstruction(instructionBytes, indexRef, segmentOverridePrefixRef);
    }

    // 37
    // aaa ASCII adjust for add
    case 0b0011_0111: {
      instruction = {
        kind: 'asciiAdjustForAdd',
      };

      break;
    }

    // 38 - 3b
    // cmp Register/memory and register
    // Layout 0011 10dw
    case 0b0011_1000:
    case 0b0011_1001:
    case 0b0011_1010:
    case 0b0011_1011: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(
        instructionBytes,
        indexRef,
        segmentOverridePrefixRef,
      );

      instruction = {
        kind: 'cmpRegisterMemoryAndRegister',
        dest,
        source,
      };

      break;
    }

    // 3c - 3d
    // cmp Immediate with accumulator
    // Layout 0011 110w
    case 0b0011_1100:
    case 0b0011_1101: {
      const [dest, data] = decodeDestDataForImmediateToAccumulatorInstruction(
        instructionBytes,
        indexRef,
      );

      instruction = {
        kind: 'cmpImmediateWithAccumulator',
        dest,
        data,
      };

      break;
    }

    // 3e
    // ds Segment override prefix
    // cursed: continue the loop and attach to the next instruction
    case 0b0011_1110: {
      segmentOverridePrefixRef.segReg = 'ds';

      indexRef.index++;

      return decodeInstruction(instructionBytes, indexRef, segmentOverridePrefixRef);
    }

    // 3f
    // aas ASCII adjust for subtract
    case 0b0011_1111: {
      instruction = {
        kind: 'asciiAdjustForSubtract',
      };

      break;
    }

    // 40 - 47
    // inc Register
    // Layout 0100 0rrr   (r = reg)
    case 0b0100_0000:
    case 0b0100_0001:
    case 0b0100_0010:
    case 0b0100_0011:
    case 0b0100_0100:
    case 0b0100_0101:
    case 0b0100_0110:
    case 0b0100_0111: {
      const register = wordRegisterTable[firstByte & 0b0000_0111];

      instruction = {
        kind: 'incRegister',
        register,
      };

      break;
    }

    // 48 - 4f
    // dec Register
    // Layout 0100 1rrr   (r = reg)
    case 0b0100_1000:
    case 0b0100_1001:
    case 0b0100_1010:
    case 0b0100_1011:
    case 0b0100_1100:
    case 0b0100_1101:
    case 0b0100_1110:
    case 0b0100_1111: {
      const register = wordRegisterTable[firstByte & 0b0000_0111];

      instruction = {
        kind: 'decRegister',
        register,
      };

      break;
    }

    // 50 - 58
    // push Register
    // Layout 0101 0rrr   (r = reg)
    case 0b0101_0000:
    case 0b0101_0001:
    case 0b0101_0010:
    case 0b0101_0011:
    case 0b0101_0100:
    case 0b0101_0101:
    case 0b0101_0110:
    case 0b0101_0111: {
      const register = wordRegisterTable[firstByte & 0b0000_0111];

      instruction = {
        kind: 'pushRegister',
        register,
      };

      break;
    }

    // 58 - 5f
    // pop Register
    // Layout 0101 1rrr   (r = reg)
    case 0b0101_1000:
    case 0b0101_1001:
    case 0b0101_1010:
    case 0b0101_1011:
    case 0b0101_1100:
    case 0b0101_1101:
    case 0b0101_1110:
    case 0b0101_1111: {
      const register = wordRegisterTable[firstByte & 0b0000_0111];

      instruction = {
        kind: 'popRegister',
        register,
      };

      break;
    }

    // 60 - 6f
    // NOT USED
    case 0b0110_0000:
    case 0b0110_0001:
    case 0b0110_0010:
    case 0b0110_0011:
    case 0b0110_0100:
    case 0b0110_0101:
    case 0b0110_0110:
    case 0b0110_0111:
    case 0b0110_1000:
    case 0b0110_1001:
    case 0b0110_1010:
    case 0b0110_1011:
    case 0b0110_1100:
    case 0b0110_1101:
    case 0b0110_1110:
    case 0b0110_1111: {
      instruction = { kind: 'NOT USED', byte: firstByte };

      break;
    }

    // 70 - 7f
    // Various short label jumps
    // Layout 0111 iiii   (i = index into a table of these)
    // We normalize these to never include equal and some other condition, i.e. "not above" rather than "below or equal"
    case 0b0111_0000:
    case 0b0111_0001:
    case 0b0111_0010:
    case 0b0111_0011:
    case 0b0111_0100:
    case 0b0111_0101:
    case 0b0111_0110:
    case 0b0111_0111:
    case 0b0111_1000:
    case 0b0111_1001:
    case 0b0111_1010:
    case 0b0111_1011:
    case 0b0111_1100:
    case 0b0111_1101:
    case 0b0111_1110:
    case 0b0111_1111: {
      indexRef.index++;

      instruction = {
        kind: shortLabelJumpInstructionTable[firstByte & 0b0000_1111],
        signedIncrement: getAsTwosComplement(instructionBytes[indexRef.index], 128),
      };

      break;
    }

    // 80 - 83
    // Standard arithmetic/logic instructions (add, or, adc, sbb, and, sub, xor, cmp)
    // Immediate to register/memory
    // Layout 1000 00sw
    case 0b1000_0000:
    case 0b1000_0001:
    case 0b1000_0010:
    case 0b1000_0011: {
      const wBit = firstByte & 0b0000_0001;
      const sBit = firstByte & 0b0000_0010;

      const [opCodeBits, destRm] = decodeMiddleThreeBitsAndModRm(instructionBytes, indexRef, wBit);

      const instructionKind =
        standardArithmeticLogicImmediateToRegisterMemoryInstructionTable[opCodeBits >> 3];

      if (
        sBit &&
        (instructionKind === 'orImmediateToRegisterMemory' ||
          instructionKind === 'andImmediateToRegisterMemory' ||
          instructionKind === 'xorImmediateToRegisterMemory')
      ) {
        instruction = { kind: 'UNKNOWN' };
        break;
      }

      let dest: RegisterOrEac;
      if (destRm.kind === 'reg') {
        dest = destRm;
      } else {
        dest = decodeEffectiveAddressCalculation(
          instructionBytes,
          indexRef,
          destRm,
          segmentOverridePrefixRef,
        );
      }

      const wBitForDataDecode = wBit && !sBit ? 1 : 0;

      let data = decodeIntLiteralData(instructionBytes, indexRef, wBitForDataDecode);

      if (sBit) {
        data = getAsTwosComplement(data, 128);
      }

      instruction = {
        kind: instructionKind,
        dest,
        data,
      };

      break;
    }

    // 88 - 8b
    // mov Register/memory to/from register
    // Layout 1000 10dw
    case 0b1000_1000:
    case 0b1000_1001:
    case 0b1000_1010:
    case 0b1000_1011: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(
        instructionBytes,
        indexRef,
        segmentOverridePrefixRef,
      );

      instruction = {
        kind: 'movRegisterMemoryToFromRegister',
        dest,
        source,
      };

      break;
    }

    // a0 - a3
    // mov Memory to/from accumulator
    // Layout 101000dw   except d is backwards from it's normal meaning lol
    case 0b1010_0000:
    case 0b1010_0001:
    case 0b1010_0010:
    case 0b1010_0011: {
      const isAccToMem = (firstByte & 0b0000_0010) === 0b0000_0010;
      const wBit = (firstByte & 0b0000_0001) === 0b0000_0001;

      const reg = wBit ? axReg : alReg;

      const displacement = decodeIntLiteralData(instructionBytes, indexRef, 1);

      const memoryAddressCalculation = {
        kind: 'mem',
        text: 'DIRECT ADDRESS',
        displacement,
      } satisfies EffectiveAddressCalculation;

      instruction = {
        kind: 'movMemoryToFromAccumulator',
        dest: isAccToMem ? memoryAddressCalculation : reg,
        source: isAccToMem ? reg : memoryAddressCalculation,
      };

      break;
    }

    // b0 - bf
    // mov Immediate to register
    // Layout 1011 wrrr   (r = reg)
    case 0b1011_0000:
    case 0b1011_0001:
    case 0b1011_0010:
    case 0b1011_0011:
    case 0b1011_0100:
    case 0b1011_0101:
    case 0b1011_0110:
    case 0b1011_0111:
    case 0b1011_1000:
    case 0b1011_1001:
    case 0b1011_1010:
    case 0b1011_1011:
    case 0b1011_1100:
    case 0b1011_1101:
    case 0b1011_1110:
    case 0b1011_1111: {
      const wBit = (firstByte & 0b0000_1000) === 0b0000_1000 ? 1 : 0;
      const dest = regTable[((firstByte & 0b0000_0111) << 1) | wBit];

      const data = decodeIntLiteralData(instructionBytes, indexRef, wBit);

      instruction = {
        kind: 'movImmediateToRegister',
        dest,
        data,
      };

      break;
    }

    // c4 - c5
    // mov Immediate to register/memory
    // Layout 1100 011w
    case 0b1100_0110:
    case 0b1100_0111: {
      const wBit = firstByte & 0b0000_0001;

      const [reg, rm] = decodeModRegRm(instructionBytes, indexRef, wBit);

      if (reg.register !== 'al' && reg.register !== 'ax') {
        throw new Error(
          'Encounted immediate move to register memory with non-000 reg in mod reg r/m byte. See table 4-13 C6/C7',
        );
      }

      let dest: RegisterOrEac;

      if (rm.kind === 'reg') {
        dest = rm;
      } else {
        dest = decodeEffectiveAddressCalculation(
          instructionBytes,
          indexRef,
          rm,
          segmentOverridePrefixRef,
        );
      }

      const data = decodeIntLiteralData(instructionBytes, indexRef, wBit);

      instruction = { kind: 'movImmediateToRegisterMemory', dest, data };

      break;
    }
    default:
      instruction = { kind: 'UNKNOWN' };
  }

  indexRef.index++;

  // If we got here without consuming the segment register prefix, something went very wrong!
  if (segmentOverridePrefixRef.segReg !== undefined) {
    throw Error('Unconsumed segment register prefix');
  }

  return instruction;
}

function decodeDestSourceForModRegRmInstruction(
  instructionBytes: InstructionBytes,
  indexRef: IndexRef,
  segmentOverridePrefixRef: SegmentOverridePrefixRef,
): [RegisterOrEac, RegisterOrEac] {
  const dBit = instructionBytes[indexRef.index] & 0b0000_0010;
  const wBit = instructionBytes[indexRef.index] & 0b0000_0001;

  const [reg, rm] = decodeModRegRm(instructionBytes, indexRef, wBit);

  const destRm = dBit ? reg : rm;
  const sourceRm = dBit ? rm : reg;

  let dest: RegisterOrEac;
  let source: RegisterOrEac;

  if (destRm.kind === 'eac') {
    assertIsRegister(sourceRm);
    source = sourceRm;

    dest = decodeEffectiveAddressCalculation(
      instructionBytes,
      indexRef,
      destRm,
      segmentOverridePrefixRef,
    );
  } else if (sourceRm.kind === 'eac') {
    dest = destRm;

    source = decodeEffectiveAddressCalculation(
      instructionBytes,
      indexRef,
      sourceRm,
      segmentOverridePrefixRef,
    );
  } else {
    dest = destRm;
    source = sourceRm;
  }

  return [dest, source];
}

// mod/reg/rm byte has structure | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
//                               |  mod  |    reg    |     rm    |
//
// wBit is in bit index 7
function decodeModRegRm(
  instructionBytes: InstructionBytes,
  indexRef: IndexRef,
  wBit: number,
): [Register, RegisterOrEacCategory] {
  const [regBits, registerOrEacCategory] = decodeMiddleThreeBitsAndModRm(
    instructionBytes,
    indexRef,
    wBit,
  );

  // reg bits are index 2, 3, 4. Shift them over 2 and & them with the wBit (last) to get a number in the range 0..16,
  // which is effectively table 4-9
  const regTableLookup = (regBits >> 2) | wBit;
  const reg = regTable[regTableLookup];

  return [reg, registerOrEacCategory];
}

function decodeMiddleThreeBitsAndModRm(
  instructionBytes: InstructionBytes,
  indexRef: IndexRef,
  wBit: number,
): [number, RegisterOrEacCategory] {
  const byte = instructionBytes[++indexRef.index];

  // mod bits are the first two - 11 means that the "register or memory" part is a register,
  // else we'll find an effective address calculation category
  const modRmIsRegister = (0b1100_0000 & byte) === 0b1100_0000;

  const middleThreeBits = 0b0011_1000 & byte;

  if (modRmIsRegister) {
    // If mod is register, we just use different bits to look up into the same reg table (4-9, or the first part of 4-10)
    const rmReg = regTable[((byte & 0b0000_0111) << 1) | wBit];

    return [middleThreeBits, rmReg];
  } else {
    // If mod is memory mode (i.e. no register-to-register), use the relevant bits (mod and rm) on the effective address table (4-10)
    const rmEac = effectiveAddressTable[byte & 0b1100_0111];

    return [middleThreeBits, rmEac];
  }
}

function assertIsRegister(rm: RegisterOrEacCategory): asserts rm is Register {
  if (rm.kind === 'eac') {
    throw new Error(`Expected register, got ${rm.kind} ${rm.text}`);
  }
}

// possibleDisplacementBytes could possible be undefined if we're reading the last instruction.
// But in a valid instruction stream we should never have displacement that reads into those bytes, obv
function decodeEffectiveAddressCalculation(
  instructionBytes: InstructionBytes,
  indexRef: IndexRef,
  category: EffectiveAddressCalculationCategory,
  segmentOverridePrefixRef: SegmentOverridePrefixRef,
): EffectiveAddressCalculation {
  let displacement: number | null;

  if (category.displacementBytes === 0) {
    displacement = null;
  } else if (category.displacementBytes === 1) {
    displacement = getAsTwosComplement(instructionBytes[indexRef.index + 1], 128);
  } else {
    displacement = getAsTwosComplement(
      instructionBytes[indexRef.index + 1] + (instructionBytes[indexRef.index + 2] << 8),
      32768,
    );
  }

  indexRef.index += category.displacementBytes;

  let segmentOverridePrefix: SegmentRegister | undefined = undefined;
  if (segmentOverridePrefixRef.segReg !== undefined) {
    segmentOverridePrefix = segmentOverridePrefixRef.segReg;

    segmentOverridePrefixRef.segReg = undefined;
  }

  return { kind: 'mem', text: category.text, displacement, segmentOverridePrefix };
}

function getAsTwosComplement(val: number, max: 128 | 32768): number {
  if (val < max) {
    return val;
  } else {
    return -2 * max + val;
  }
}

function decodeDestDataForImmediateToAccumulatorInstruction(
  instructionBytes: InstructionBytes,
  indexRef: IndexRef,
): [AccumulatorRegister, number] {
  const wBit = instructionBytes[indexRef.index] & 0b0000_0001;

  const data = decodeIntLiteralData(instructionBytes, indexRef, wBit);

  const dest = wBit ? axReg : alReg;

  return [dest, data];
}

function decodeIntLiteralData(
  instructionBytes: InstructionBytes,
  indexRef: IndexRef,
  wBit: number,
): number {
  if (wBit === 0) {
    indexRef.index++;

    return instructionBytes[indexRef.index];
  } else {
    indexRef.index += 2;

    return instructionBytes[indexRef.index - 1] + (instructionBytes[indexRef.index] << 8);
  }
}
