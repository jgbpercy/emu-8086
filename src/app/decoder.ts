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
  | 'AL'
  | 'BL'
  | 'CL'
  | 'DL'
  | 'AH'
  | 'BH'
  | 'CH'
  | 'DH'
  | 'AX'
  | 'BX'
  | 'CX'
  | 'DX'
  | 'SP'
  | 'BP'
  | 'SI'
  | 'DI';

type EffectiveAddressCalculation =
  | 'BX + SI'
  | 'BX + DI'
  | 'BP + SI'
  | 'BP + DI'
  | 'SI'
  | 'DI'
  | 'DIRECT ADDRESS'
  | 'BX'
  | 'BP';

type Displacement = 'register' | 0 | 8 | 16;

type Rm = Reg | EffectiveAddressCalculation;

type RegRm = [Reg, Rm, Displacement];

const regTable: ReadonlyArray<Reg> = [
  // reg 000 w 0
  'AL',
  // reg 000 w 1
  'AX',
  // reg 001 w 0
  'CL',
  // reg 001 w 1
  'CX',
  // reg 010 w 0
  'DL',
  // reg 010 w 1
  'DX',
  // reg 011 w 0
  'BL',
  // reg 011 w 1
  'BX',
  // reg 100 w 0
  'AH',
  // reg 100 w 1
  'SP',
  // reg 101 w 0
  'CH',
  // reg 101 w 1
  'BP',
  // reg 110 w 0
  'DH',
  // reg 110 w 1
  'SI',
  // reg 111 w 0
  'BH',
  // reg 111 w 1
  'DI',
];

const effectiveAddressTable: Readonly<Record<number, [Rm, Displacement]>> = {
  // mod 00, rm 000
  [0b0000_0000]: ['BX + SI', 0],
  // mod 00, rm 001
  [0b0000_0001]: ['BX + DI', 0],
  // mod 00, rm 010
  [0b0000_0010]: ['BP + SI', 0],
  // mod 00, rm 011
  [0b0000_0011]: ['BP + DI', 0],
  // mod 00, rm 100
  [0b0000_0100]: ['SI', 0],
  // mod 00, rm 101
  [0b0000_0101]: ['DI', 0],
  // mod 00, rm 110
  [0b0000_0110]: ['DIRECT ADDRESS', 0],
  // mod 00, rm 111
  [0b0000_0111]: ['BX', 0],
  // mod 01, rm 000
  [0b0100_0000]: ['BX + SI', 8],
  // mod 01, rm 001
  [0b0100_0001]: ['BX + DI', 8],
  // mod 01, rm 010
  [0b0100_0010]: ['BP + SI', 8],
  // mod 01, rm 011
  [0b0100_0011]: ['BP + DI', 8],
  // mod 01, rm 100
  [0b0100_0100]: ['SI', 8],
  // mod 01, rm 101
  [0b0100_0101]: ['DI', 8],
  // mod 01, rm 110
  [0b0100_0110]: ['BP', 8],
  // mod 01, rm 111
  [0b0100_0111]: ['DX', 8],
  // mod 10, rm 000
  [0b1000_0000]: ['BX + SI', 16],
  // mod 10, rm 001
  [0b1000_0001]: ['BX + DI', 16],
  // mod 10, rm 010
  [0b1000_0010]: ['BP + SI', 16],
  // mod 10, rm 011
  [0b1000_0011]: ['BP + DI', 16],
  // mod 10, rm 100
  [0b1000_0100]: ['SI', 16],
  // mod 10, rm 101
  [0b1000_0101]: ['DI', 16],
  // mod 10, rm 110
  [0b1000_0110]: ['BP', 16],
  // mod 10, rm 111
  [0b1000_0111]: ['BX', 16],
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
