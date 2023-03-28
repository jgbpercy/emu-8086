export type RegisterName =
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

export interface Register {
  kind: 'reg';
  register: RegisterName;
}

export const alReg = { kind: 'reg', register: 'al' } as const;
export const axReg = { kind: 'reg', register: 'ax' } as const;
export const clReg = { kind: 'reg', register: 'cl' } as const;
export const cxReg = { kind: 'reg', register: 'cx' } as const;
export const dlReg = { kind: 'reg', register: 'dl' } as const;
export const dxReg = { kind: 'reg', register: 'dx' } as const;
export const blReg = { kind: 'reg', register: 'bl' } as const;
export const bxReg = { kind: 'reg', register: 'bx' } as const;
export const ahReg = { kind: 'reg', register: 'ah' } as const;
export const spReg = { kind: 'reg', register: 'sp' } as const;
export const chReg = { kind: 'reg', register: 'ch' } as const;
export const bpReg = { kind: 'reg', register: 'bp' } as const;
export const dhReg = { kind: 'reg', register: 'dh' } as const;
export const siReg = { kind: 'reg', register: 'si' } as const;
export const bhReg = { kind: 'reg', register: 'bh' } as const;
export const diReg = { kind: 'reg', register: 'di' } as const;

export type WordRegister =
  | typeof axReg
  | typeof bxReg
  | typeof cxReg
  | typeof dxReg
  | typeof spReg
  | typeof bpReg
  | typeof siReg
  | typeof diReg;

// table 4-9
export const registerDecodingTable: ReadonlyArray<Register> = [
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

export const wordRegisterDecodingTable: ReadonlyArray<WordRegister> = [
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

export interface RegisterEncodingData {
  readonly word: boolean;
  readonly regBits: number;
  readonly regBitsString: string;
}

const _regEncodingTable: Record<string, RegisterEncodingData> = Object.fromEntries(
  registerDecodingTable.map((reg, i) => {
    const word = i & 0b0001 ? true : false;

    const regBits = (i & 0b1110) >> 1;

    const regBitsString = regBits.toString(2).padStart(3, '0');

    const data: RegisterEncodingData = {
      word,
      regBits,
      regBitsString,
    };

    return [reg.register, data];
  }),
);

export const registerEncodingTable = _regEncodingTable as Readonly<
  Record<RegisterName, RegisterEncodingData>
>;
