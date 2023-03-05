export interface AddInstruction {
  readonly kind: 'ADD';
}

export interface MovInstruction {
  readonly kind: 'MOV';
  readonly dest: Rm;
  readonly source: Rm;
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

        const [reg, rm, displacement] = decodeModRegRm(instructionBytes[index], wBit);

        const dest = dBit ? reg : rm;
        const source = dBit ? rm : reg;

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

type Reg =
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

type EffectiveAddressCalculation =
  | { text: 'bx + si' }
  | { text: 'bx + di' }
  | { text: 'bp + si' }
  | { text: 'bp + di' }
  | { text: 'si' }
  | { text: 'di' }
  | { text: 'DIRECT ADDRESS' }
  | { text: 'bx' }
  | { text: 'bp' };

type Displacement = 'register' | 0 | 8 | 16;

type Rm = Reg | EffectiveAddressCalculation;

type RegRm = [Reg, Rm, Displacement];

const regTable: ReadonlyArray<Reg> = [
  // reg 000 w 0
  'al',
  // reg 000 w 1
  'ax',
  // reg 001 w 0
  'cl',
  // reg 001 w 1
  'cx',
  // reg 010 w 0
  'dl',
  // reg 010 w 1
  'dx',
  // reg 011 w 0
  'bl',
  // reg 011 w 1
  'bx',
  // reg 100 w 0
  'ah',
  // reg 100 w 1
  'sp',
  // reg 101 w 0
  'ch',
  // reg 101 w 1
  'bp',
  // reg 110 w 0
  'dh',
  // reg 110 w 1
  'si',
  // reg 111 w 0
  'bh',
  // reg 111 w 1
  'di',
];

const effectiveAddressTable: Readonly<Record<number, [EffectiveAddressCalculation, Displacement]>> =
  {
    // mod 00, rm 000
    [0b0000_0000]: [{ text: 'bx + si' }, 0],
    // mod 00, rm 001
    [0b0000_0001]: [{ text: 'bx + di' }, 0],
    // mod 00, rm 010
    [0b0000_0010]: [{ text: 'bp + si' }, 0],
    // mod 00, rm 011
    [0b0000_0011]: [{ text: 'bp + di' }, 0],
    // mod 00, rm 100
    [0b0000_0100]: [{ text: 'si' }, 0],
    // mod 00, rm 101
    [0b0000_0101]: [{ text: 'di' }, 0],
    // mod 00, rm 110
    [0b0000_0110]: [{ text: 'DIRECT ADDRESS' }, 0],
    // mod 00, rm 111
    [0b0000_0111]: [{ text: 'bx' }, 0],
    // mod 01, rm 000
    [0b0100_0000]: [{ text: 'bx + si' }, 8],
    // mod 01, rm 001
    [0b0100_0001]: [{ text: 'bx + di' }, 8],
    // mod 01, rm 010
    [0b0100_0010]: [{ text: 'bp + si' }, 8],
    // mod 01, rm 011
    [0b0100_0011]: [{ text: 'bp + di' }, 8],
    // mod 01, rm 100
    [0b0100_0100]: [{ text: 'si' }, 8],
    // mod 01, rm 101
    [0b0100_0101]: [{ text: 'di' }, 8],
    // mod 01, rm 110
    [0b0100_0110]: [{ text: 'bp' }, 8],
    // mod 01, rm 111
    [0b0100_0111]: [{ text: 'bx' }, 8],
    // mod 10, rm 000
    [0b1000_0000]: [{ text: 'bx + si' }, 16],
    // mod 10, rm 001
    [0b1000_0001]: [{ text: 'bx + di' }, 16],
    // mod 10, rm 010
    [0b1000_0010]: [{ text: 'bp + si' }, 16],
    // mod 10, rm 011
    [0b1000_0011]: [{ text: 'bp + di' }, 16],
    // mod 10, rm 100
    [0b1000_0100]: [{ text: 'si' }, 16],
    // mod 10, rm 101
    [0b1000_0101]: [{ text: 'di' }, 16],
    // mod 10, rm 110
    [0b1000_0110]: [{ text: 'bp' }, 16],
    // mod 10, rm 111
    [0b1000_0111]: [{ text: 'bx' }, 16],
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
    const rm = regTable[((byte & 0b0000_0111) << 1) | wBit];

    return [reg, rm, 'register'];
  } else {
    // If mod is memory mode (i.e. no register-to-register), use the relevant bits (mod and rm) on the effective address table (4-10)
    const [rm, displacement] = effectiveAddressTable[byte & 0b1110_0011];

    return [reg, rm, displacement];
  }
}
