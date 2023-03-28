type _EffectiveAddressCalculationCategory = { kind: 'eac' } & (
  | { calculationKind: 'bx + si'; displacementBytes: 0 | 1 | 2 }
  | { calculationKind: 'bx + di'; displacementBytes: 0 | 1 | 2 }
  | { calculationKind: 'bp + si'; displacementBytes: 0 | 1 | 2 }
  | { calculationKind: 'bp + di'; displacementBytes: 0 | 1 | 2 }
  | { calculationKind: 'si'; displacementBytes: 0 | 1 | 2 }
  | { calculationKind: 'di'; displacementBytes: 0 | 1 | 2 }
  | { calculationKind: 'DIRECT ADDRESS'; displacementBytes: 2 }
  | { calculationKind: 'bx'; displacementBytes: 0 | 1 | 2 }
  | { calculationKind: 'bp'; displacementBytes: 1 | 2 }
);

export type EffectiveAddressCalculationCategory = {
  kind: 'eac';
} & _EffectiveAddressCalculationCategory;

// table 4-10
export const effectiveAddressDecodingTable: Readonly<
  Record<number, EffectiveAddressCalculationCategory>
> = {
  // mod 00, rm 000
  [0b0000_0000]: { kind: 'eac', calculationKind: 'bx + si', displacementBytes: 0 },
  // mod 00, rm 001
  [0b0000_0001]: { kind: 'eac', calculationKind: 'bx + di', displacementBytes: 0 },
  // mod 00, rm 010
  [0b0000_0010]: { kind: 'eac', calculationKind: 'bp + si', displacementBytes: 0 },
  // mod 00, rm 011
  [0b0000_0011]: { kind: 'eac', calculationKind: 'bp + di', displacementBytes: 0 },
  // mod 00, rm 100
  [0b0000_0100]: { kind: 'eac', calculationKind: 'si', displacementBytes: 0 },
  // mod 00, rm 101
  [0b0000_0101]: { kind: 'eac', calculationKind: 'di', displacementBytes: 0 },
  // mod 00, rm 110
  [0b0000_0110]: { kind: 'eac', calculationKind: 'DIRECT ADDRESS', displacementBytes: 2 },
  // mod 00, rm 111
  [0b0000_0111]: { kind: 'eac', calculationKind: 'bx', displacementBytes: 0 },
  // mod 01, rm 000
  [0b0100_0000]: { kind: 'eac', calculationKind: 'bx + si', displacementBytes: 1 },
  // mod 01, rm 001
  [0b0100_0001]: { kind: 'eac', calculationKind: 'bx + di', displacementBytes: 1 },
  // mod 01, rm 010
  [0b0100_0010]: { kind: 'eac', calculationKind: 'bp + si', displacementBytes: 1 },
  // mod 01, rm 011
  [0b0100_0011]: { kind: 'eac', calculationKind: 'bp + di', displacementBytes: 1 },
  // mod 01, rm 100
  [0b0100_0100]: { kind: 'eac', calculationKind: 'si', displacementBytes: 1 },
  // mod 01, rm 101
  [0b0100_0101]: { kind: 'eac', calculationKind: 'di', displacementBytes: 1 },
  // mod 01, rm 110
  [0b0100_0110]: { kind: 'eac', calculationKind: 'bp', displacementBytes: 1 },
  // mod 01, rm 111
  [0b0100_0111]: { kind: 'eac', calculationKind: 'bx', displacementBytes: 1 },
  // mod 10, rm 000
  [0b1000_0000]: { kind: 'eac', calculationKind: 'bx + si', displacementBytes: 2 },
  // mod 10, rm 001
  [0b1000_0001]: { kind: 'eac', calculationKind: 'bx + di', displacementBytes: 2 },
  // mod 10, rm 010
  [0b1000_0010]: { kind: 'eac', calculationKind: 'bp + si', displacementBytes: 2 },
  // mod 10, rm 011
  [0b1000_0011]: { kind: 'eac', calculationKind: 'bp + di', displacementBytes: 2 },
  // mod 10, rm 100
  [0b1000_0100]: { kind: 'eac', calculationKind: 'si', displacementBytes: 2 },
  // mod 10, rm 101
  [0b1000_0101]: { kind: 'eac', calculationKind: 'di', displacementBytes: 2 },
  // mod 10, rm 110
  [0b1000_0110]: { kind: 'eac', calculationKind: 'bp', displacementBytes: 2 },
  // mod 10, rm 111
  [0b1000_0111]: { kind: 'eac', calculationKind: 'bx', displacementBytes: 2 },
};

export interface EffectiveAddressEncodingData {
  readonly modRmBits: number;
  readonly modBitsString: string;
  readonly rmBitsString: string;
}

const _effectiveAddressEncodingTable: Partial<
  Record<
    _EffectiveAddressCalculationCategory['calculationKind'],
    Partial<Record<0 | 1 | 2, EffectiveAddressEncodingData>>
  >
> = {};

for (const [key, eacCategory] of Object.entries(effectiveAddressDecodingTable)) {
  const modRmBits = parseInt(key, 10);

  const data: EffectiveAddressEncodingData = {
    modRmBits,
    modBitsString: ((modRmBits & 0b1100_0000) >> 6).toString(2).padStart(2, '0'),
    rmBitsString: (modRmBits & 0b0111).toString(2).padStart(3, '0'),
  };

  const existingEntry = _effectiveAddressEncodingTable[eacCategory.calculationKind];

  if (existingEntry === undefined) {
    _effectiveAddressEncodingTable[eacCategory.calculationKind] = {
      [eacCategory.displacementBytes]: data,
    };
  } else {
    existingEntry[eacCategory.displacementBytes] = data;
  }
}

console.log(_effectiveAddressEncodingTable);

export const effectiveAddressEncodingTable = _effectiveAddressEncodingTable as Readonly<
  Record<
    _EffectiveAddressCalculationCategory['calculationKind'],
    Readonly<Partial<Record<0 | 1 | 2, EffectiveAddressEncodingData>>>
  >
>;
