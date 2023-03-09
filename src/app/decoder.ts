export interface EffectiveAddressCalculation {
  readonly kind: 'mem';
  readonly text: EffectiveAddressCalculationCategory['text'];
  readonly displacement: number | null;
}

export type SourceOrDestination = Register | EffectiveAddressCalculation;

export interface AddRegisterMemoryWithRegisterToEitherInstruction {
  readonly kind: 'addRegisterMemoryWithRegisterToEither';
  readonly dest: SourceOrDestination;
  readonly source: SourceOrDestination;
}

export interface AddImmediateToAccumulatorInstruction {
  readonly kind: 'addImmediateToAccumulator';
  readonly dest: typeof axReg | typeof alReg;
  readonly data: number;
}

export interface PushSegmentRegisterInstruction {
  readonly kind: 'pushSegmentRegister';
  readonly register: SegmentRegister;
}

export interface PopSegmentRegisterInstructions {
  readonly kind: 'popSegmentRegister';
  readonly register: SegmentRegister;
}

export interface MovRegisterMemoryToFromRegisterInstruction {
  readonly kind: 'movRegisterMemoryToFromRegister';
  readonly dest: SourceOrDestination;
  readonly source: SourceOrDestination;
}

export interface MovImmediateToRegisterMemoryInstruction {
  readonly kind: 'movImmediateToRegisterMemory';
  readonly dest: SourceOrDestination;
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
    | typeof axReg
    | typeof alReg
    | { kind: 'mem'; text: 'DIRECT ADDRESS'; displacement: number };
  readonly source:
    | typeof axReg
    | typeof alReg
    | { kind: 'mem'; text: 'DIRECT ADDRESS'; displacement: number };
}

export interface UnknownInstruction {
  readonly kind: 'UNKNOWN';
}

export type DecodedInstruction =
  | AddRegisterMemoryWithRegisterToEitherInstruction
  | AddImmediateToAccumulatorInstruction
  | PushSegmentRegisterInstruction
  | PopSegmentRegisterInstructions
  | MovRegisterMemoryToFromRegisterInstruction
  | MovImmediateToRegisterMemoryInstruction
  | MovImmediateToRegisterInstruction
  | MovMemoryToFromAccumulatorInstruction
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

type SegmentRegister = 'es' | 'cs' | 'ss' | 'ds';

type EffectiveAddressCalculationCategory = { kind: 'eac' } & _EffectiveAddressCalculationCategory;

export type Rm = Register | EffectiveAddressCalculationCategory;

type RegRm = [Register, Rm];

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

interface IndexRef {
  index: number;
}

type InstructionBytes = Uint8Array;

export function decodeInstructions(
  instructionBytes: InstructionBytes,
): ReadonlyArray<DecodedInstruction> {
  const instructions: DecodedInstruction[] = [];
  const indexRef = { index: 0 };

  while (indexRef.index < instructionBytes.length) {
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
        const [dest, source] = decodeModRegRmDestAndSource(instructionBytes, indexRef);

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
        const wBit = firstByte & 0b0000_0001;

        const data = getIntLiteralData(instructionBytes, indexRef, wBit);

        const dest = wBit ? axReg : alReg;

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

      // 88 - 8B
      // mov Register/memory to/from register
      // Layout 1000 10dw
      case 0b1000_1000:
      case 0b1000_1001:
      case 0b1000_1010:
      case 0b1000_1011: {
        const [dest, source] = decodeModRegRmDestAndSource(instructionBytes, indexRef);

        instruction = {
          kind: 'movRegisterMemoryToFromRegister',
          dest,
          source,
        };

        break;
      }

      // A0 - A3
      // mov Memory to/from accumulator
      // Layout 101000dw   except d is backwards from it's normal meaning lol
      case 0b1010_0000:
      case 0b1010_0001:
      case 0b1010_0010:
      case 0b1010_0011: {
        const isAccToMem = (firstByte & 0b0000_0010) === 0b0000_0010;
        const wBit = (firstByte & 0b0000_0001) === 0b0000_0001;

        const reg = wBit ? axReg : alReg;

        const displacement = getIntLiteralData(instructionBytes, indexRef, 1);

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

      // B0 - BF
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

        const data = getIntLiteralData(instructionBytes, indexRef, wBit);

        instruction = {
          kind: 'movImmediateToRegister',
          dest,
          data,
        };

        break;
      }

      // C4 - C5
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

        let dest: SourceOrDestination;

        if (rm.kind === 'reg') {
          dest = rm;
        } else {
          dest = getEffectiveAddressCalculation(instructionBytes, indexRef, rm);
        }

        const data = getIntLiteralData(instructionBytes, indexRef, wBit);

        instruction = { kind: 'movImmediateToRegisterMemory', dest, data };

        break;
      }
      default:
        instruction = { kind: 'UNKNOWN' };
    }

    indexRef.index++;
    instructions.push(instruction);
  }

  return instructions;
}

function decodeModRegRmDestAndSource(
  instructionBytes: InstructionBytes,
  indexRef: IndexRef,
): [SourceOrDestination, SourceOrDestination] {
  const dBit = instructionBytes[indexRef.index] & 0b0000_0010;
  const wBit = instructionBytes[indexRef.index] & 0b0000_0001;

  const [reg, rm] = decodeModRegRm(instructionBytes, indexRef, wBit);

  const destRm = dBit ? reg : rm;
  const sourceRm = dBit ? rm : reg;

  let dest: SourceOrDestination;
  let source: SourceOrDestination;

  if (destRm.kind === 'eac') {
    assertIsRegister(sourceRm);
    source = sourceRm;

    dest = getEffectiveAddressCalculation(instructionBytes, indexRef, destRm);
  } else if (sourceRm.kind === 'eac') {
    dest = destRm;

    source = getEffectiveAddressCalculation(instructionBytes, indexRef, sourceRm);
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
): RegRm {
  const byte = instructionBytes[++indexRef.index];

  // mod bits are the first two - 11 is register-to-register, else we'll use this in the
  const isRegisterToRegister = (0b1100_0000 & byte) === 0b1100_0000;

  // reg bits are index 2, 3, 4. Shift them over 2 and & them with the wBit (last) to get a number in the range 0..16,
  // which is effectively 4-9
  const regTableLookup = ((byte & 0b0011_1000) >> 2) | wBit;
  const reg = regTable[regTableLookup];

  if (isRegisterToRegister) {
    // If mod is register, we just use different bits to look up into the same reg table (4-9, or the first bit of 4-10)
    const rmReg = regTable[((byte & 0b0000_0111) << 1) | wBit];

    return [reg, rmReg];
  } else {
    // If mod is memory mode (i.e. no register-to-register), use the relevant bits (mod and rm) on the effective address table (4-10)
    const rmEac = effectiveAddressTable[byte & 0b1100_0111];

    return [reg, rmEac];
  }
}

function assertIsRegister(rm: Rm): asserts rm is Register {
  if (rm.kind === 'eac') {
    throw new Error(`Expected register, got ${rm.kind} ${rm.text}`);
  }
}

// possibleDisplacementBytes could possible be undefined if we're reading the last instruction.
// But in a valid instruction stream we should never have displacement that reads into those bytes, obv
function getEffectiveAddressCalculation(
  instructionBytes: InstructionBytes,
  indexRef: IndexRef,
  category: EffectiveAddressCalculationCategory,
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

  return { kind: 'mem', text: category.text, displacement };
}

function getAsTwosComplement(val: number, max: 128 | 32768): number {
  if (val < max) {
    return val;
  } else {
    return -2 * max + val;
  }
}

function getIntLiteralData(
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
