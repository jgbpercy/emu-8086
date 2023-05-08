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
  name: RegisterName;
}

export const alReg = { kind: 'reg', name: 'al' } as const;
export const axReg = { kind: 'reg', name: 'ax' } as const;
export const clReg = { kind: 'reg', name: 'cl' } as const;
export const cxReg = { kind: 'reg', name: 'cx' } as const;
export const dlReg = { kind: 'reg', name: 'dl' } as const;
export const dxReg = { kind: 'reg', name: 'dx' } as const;
export const blReg = { kind: 'reg', name: 'bl' } as const;
export const bxReg = { kind: 'reg', name: 'bx' } as const;
export const ahReg = { kind: 'reg', name: 'ah' } as const;
export const spReg = { kind: 'reg', name: 'sp' } as const;
export const chReg = { kind: 'reg', name: 'ch' } as const;
export const bpReg = { kind: 'reg', name: 'bp' } as const;
export const dhReg = { kind: 'reg', name: 'dh' } as const;
export const siReg = { kind: 'reg', name: 'si' } as const;
export const bhReg = { kind: 'reg', name: 'bh' } as const;
export const diReg = { kind: 'reg', name: 'di' } as const;

export type WordRegister =
  | typeof axReg
  | typeof bxReg
  | typeof cxReg
  | typeof dxReg
  | typeof spReg
  | typeof bpReg
  | typeof siReg
  | typeof diReg;

export type WordRegisterName = WordRegister['name'];

export type AccumulatorRegister = typeof alReg | typeof axReg;

export type SegmentRegister = 'es' | 'cs' | 'ss' | 'ds';

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

export const segmentRegisterDecodingTable: ReadonlyArray<SegmentRegister> = [
  // 00
  'es',
  // 01
  'cs',
  // 10
  'ss',
  // 11
  'ds',
];

export interface RegisterEncodingData {
  readonly word: boolean;
  readonly regBits: number;
}

const _regEncodingTable: Record<string, RegisterEncodingData> = Object.fromEntries(
  registerDecodingTable.map((reg, i) => {
    const word = i & 0b0001 ? true : false;

    const regBits = (i & 0b1110) >> 1;

    const data: RegisterEncodingData = {
      word,
      regBits,
    };

    return [reg.name, data];
  }),
);

export const registerEncodingTable = _regEncodingTable as Readonly<
  Record<RegisterName, RegisterEncodingData>
>;

const _segRegEncodingTable: Record<string, number> = Object.fromEntries(
  segmentRegisterDecodingTable.map((reg, i) => [reg, i]),
);

export const segmentRegisterEncodingTable = _segRegEncodingTable as Readonly<
  Record<SegmentRegister, number>
>;

export function isWordRegister(register: Register): register is WordRegister {
  return (
    register.name === 'ax' ||
    register.name === 'bx' ||
    register.name === 'cx' ||
    register.name === 'dx' ||
    register.name === 'sp' ||
    register.name === 'bp' ||
    register.name === 'si' ||
    register.name === 'di'
  );
}

export const mainRegisterTable: Readonly<Record<RegisterName, WordRegisterName>> = {
  ax: 'ax',
  bx: 'bx',
  cx: 'cx',
  dx: 'dx',
  ah: 'ax',
  bh: 'bx',
  ch: 'cx',
  dh: 'dx',
  al: 'ax',
  bl: 'bx',
  cl: 'cx',
  dl: 'dx',
  bp: 'bp',
  sp: 'sp',
  si: 'si',
  di: 'di',
};

export function isHigh8BitRegister(register: Register): boolean {
  return (
    register.name === 'ah' ||
    register.name === 'bh' ||
    register.name === 'ch' ||
    register.name === 'dh'
  );
}
