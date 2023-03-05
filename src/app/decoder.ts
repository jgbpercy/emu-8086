export interface EffectiveAddressCalculation {
  readonly kind: 'mem';
  readonly text: EffectiveAddressCalculationCategory['text'];
  readonly displacement: number | null;
}

export type SourceOrDestination = Register | EffectiveAddressCalculation;

export interface AddInstruction {
  readonly kind: 'ADD';
}

export interface MovInstruction {
  readonly kind: 'MOV';
  readonly dest: SourceOrDestination;
  readonly source: SourceOrDestination;
}

export interface OrInstruction {
  readonly kind: 'OR';
}

export interface PopInstruction {
  readonly kind: 'POP';
}

export interface PushInstruction {
  readonly kind: 'PUSH';
}

export interface UnknownInstruction {
  readonly kind: 'UNKNOWN';
}

export type DecodedInstruction = MovInstruction | UnknownInstruction | AddInstruction;

export function decodeInstructions(
  instructionBytes: Uint8Array,
): ReadonlyArray<DecodedInstruction> {
  const instructions: DecodedInstruction[] = [];
  let index = 0;

  while (index < instructionBytes.length) {
    const firstByte = instructionBytes[index];
    const firstSixBits = firstByte & 0b1111_1100;

    switch (firstSixBits) {
      case 0b1000_1000: {
        const dBit = firstByte & 0b0000_0010;
        const wBit = firstByte & 0b0000_0001;

        index++;

        const [reg, rm] = decodeModRegRm(instructionBytes[index], wBit);

        const destRm = dBit ? reg : rm;
        const sourceRm = dBit ? rm : reg;

        let dest: SourceOrDestination;
        let source: SourceOrDestination;

        if (destRm.kind === 'eac') {
          assertIsRegister(sourceRm);
          source = sourceRm;

          dest = getEffectiveAddressCalculation(destRm, [
            instructionBytes[index + 1],
            instructionBytes[index + 2],
          ]);

          index += destRm.displacementBytes;
        } else if (sourceRm.kind === 'eac') {
          dest = destRm;

          source = getEffectiveAddressCalculation(sourceRm, [
            instructionBytes[index + 1],
            instructionBytes[index + 2],
          ]);

          index += sourceRm.displacementBytes;
        } else {
          dest = destRm;
          source = sourceRm;
        }

        instructions.push({
          kind: 'MOV',
          dest,
          source,
        });

        index++;
        break;
      }
      default:
        instructions.push({ kind: 'UNKNOWN' });
        index++;
    }
  }

  return instructions;
}

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

type EffectiveAddressCalculationCategory = { kind: 'eac' } & _EffectiveAddressCalculationCategory;

export type Rm = Register | EffectiveAddressCalculationCategory;

type RegRm = [Register, Rm];

// table 4-9
const regTable: ReadonlyArray<Register> = [
  // reg 000 w 0
  { kind: 'reg', register: 'al' },
  // reg 000 w 1
  { kind: 'reg', register: 'ax' },
  // reg 001 w 0
  { kind: 'reg', register: 'cl' },
  // reg 001 w 1
  { kind: 'reg', register: 'cx' },
  // reg 010 w 0
  { kind: 'reg', register: 'dl' },
  // reg 010 w 1
  { kind: 'reg', register: 'dx' },
  // reg 011 w 0
  { kind: 'reg', register: 'bl' },
  // reg 011 w 1
  { kind: 'reg', register: 'bx' },
  // reg 100 w 0
  { kind: 'reg', register: 'ah' },
  // reg 100 w 1
  { kind: 'reg', register: 'sp' },
  // reg 101 w 0
  { kind: 'reg', register: 'ch' },
  // reg 101 w 1
  { kind: 'reg', register: 'bp' },
  // reg 110 w 0
  { kind: 'reg', register: 'dh' },
  // reg 110 w 1
  { kind: 'reg', register: 'si' },
  // reg 111 w 0
  { kind: 'reg', register: 'bh' },
  // reg 111 w 1
  { kind: 'reg', register: 'di' },
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

// mod/reg/rm byte has structure | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
//                               |  mod  |    reg    |     rm    |
//
// wBit is in bit index 7
function decodeModRegRm(byte: number, wBit: number): RegRm {
  // mod bits are the first two - 11 is register-to-register, else we'll use this in the
  const isRegisterToRegister = (0b1100_0000 & byte) === 0b1100_0000;

  // reg bits are index 2, 3, 4. Shift them over 2 and & them with the wBit (last) to get a number in the range 0..16,
  // which is effectively 4-9
  const regTableLookup = ((byte & 0b0011_1000) >> 2) | wBit;
  console.log(regTableLookup);
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
  category: EffectiveAddressCalculationCategory,
  possibleDisplacementBytes: [number, number],
): EffectiveAddressCalculation {
  let displacement: number | null;

  if (category.displacementBytes === 0) {
    displacement = null;
  } else if (category.displacementBytes === 1) {
    displacement = possibleDisplacementBytes[0];
  } else {
    displacement = possibleDisplacementBytes[0] + (possibleDisplacementBytes[1] << 8);
  }

  return { kind: 'mem', text: category.text, displacement };
}
