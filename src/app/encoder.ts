import { DecodedInstruction, EffectiveAddressCalculation, RegisterOrEac } from './decoder';
import { effectiveAddressEncodingTable } from './effective-address-data';
import {
  AccumulatorRegister,
  registerEncodingTable,
  SegmentRegister,
  segmentRegisterEncodingTable,
  WordRegister
} from './register-data';

export type AnnotatedBitsCategory =
  | 'opCode'
  | 'mod'
  | 'reg'
  | 'rm'
  | 'dBit'
  | 'wBit'
  | 'sBit'
  | 'segReg'
  | 'segmentOverridePrefixCode'
  | 'ipInc8'
  | 'dispLo'
  | 'dispHi'
  | 'dataLo'
  | 'dataHi';

export interface AnnotatedBits {
  readonly value: number;
  readonly length: number;
  readonly category: AnnotatedBitsCategory;
  readonly linkedPartIndices?: number[];
}

export function encodeBitAnnotations(
  instruction: DecodedInstruction,
): ReadonlyArray<AnnotatedBits> {
  switch (instruction.kind) {
    case 'addRegisterMemoryWithRegisterToEither':
      return encodeModRegRmInstructionBitAnnotations(0b0000_00, instruction);

    case 'addImmediateToAccumulator':
      return encodeWbitImmediateDataToAccumulatorInstructionBitAnnotations(0b0000_010, instruction);

    case 'pushSegmentRegister':
      return [
        {
          category: 'opCode',
          value: 0b000,
          length: 3,
          linkedPartIndices: [2],
        },
        encodeSegmentRegisterBitAnnotation(instruction.op1),
        {
          category: 'opCode',
          value: 0b110,
          length: 3,
          linkedPartIndices: [0],
        },
      ];

    case 'popSegmentRegister':
      return [
        {
          category: 'opCode',
          value: 0b000,
          length: 3,
          linkedPartIndices: [2],
        },
        encodeSegmentRegisterBitAnnotation(instruction.op1),
        {
          category: 'opCode',
          value: 0b111,
          length: 3,
          linkedPartIndices: [0],
        },
      ];

    case 'orRegisterMemoryAndRegisterToEither':
      return encodeModRegRmInstructionBitAnnotations(0b0000_10, instruction);

    case 'orImmediateToAccumulator':
      return encodeWbitImmediateDataToAccumulatorInstructionBitAnnotations(0b0000_110, instruction);

    case 'adcRegisterMemoryWithRegisterToEither':
      return encodeModRegRmInstructionBitAnnotations(0b000_100, instruction);

    case 'adcImmediateToAccumulator':
      return encodeWbitImmediateDataToAccumulatorInstructionBitAnnotations(0b0001_010, instruction);

    case 'sbbRegisterMemoryAndRegisterToEither':
      return encodeModRegRmInstructionBitAnnotations(0b0001_10, instruction);

    case 'sbbImmediateFromAccumulator':
      return encodeWbitImmediateDataToAccumulatorInstructionBitAnnotations(0b0001_110, instruction);

    case 'andRegisterMemoryWithRegisterToEither':
      return encodeModRegRmInstructionBitAnnotations(0b0010_00, instruction);

    case 'andImmediateToAccumulator':
      return encodeWbitImmediateDataToAccumulatorInstructionBitAnnotations(0b0010_010, instruction);

    case 'subRegisterMemoryAndRegisterToEither':
      return encodeModRegRmInstructionBitAnnotations(0b0010_10, instruction);

    case 'subImmediateFromAccumulator':
      return encodeWbitImmediateDataToAccumulatorInstructionBitAnnotations(0b0010_110, instruction);

    case 'xorRegisterMemoryAndRegisterToEither':
      return encodeModRegRmInstructionBitAnnotations(0b0011_00, instruction);

    case 'xorImmediateToAccumulator':
      return encodeWbitImmediateDataToAccumulatorInstructionBitAnnotations(0b0011_010, instruction);

    case 'cmpRegisterMemoryAndRegister':
      return encodeModRegRmInstructionBitAnnotations(0b0011_10, instruction);

    case 'cmpImmediateWithAccumulator':
      return encodeWbitImmediateDataToAccumulatorInstructionBitAnnotations(0b0011_110, instruction);

    case 'incRegister':
      return encodeDirectOnWordRegisterBitAnnotations(0b0100_0, instruction);

    case 'decRegister':
      return encodeDirectOnWordRegisterBitAnnotations(0b0100_1, instruction);

    case 'pushRegister':
      return encodeDirectOnWordRegisterBitAnnotations(0b0101_0, instruction);

    case 'popRegister':
      return encodeDirectOnWordRegisterBitAnnotations(0b0101_1, instruction);

    case 'joJumpOnOverflow':
      return encodeShortLabelJumpInstructionBitAnnotations(0b0111_0000, instruction);

    case 'jnoJumpOnNotOverflow':
      return encodeShortLabelJumpInstructionBitAnnotations(0b0111_0001, instruction);

    case 'jbJumpOnBelow':
      return encodeShortLabelJumpInstructionBitAnnotations(0b0111_0010, instruction);

    case 'jnbJumpOnNotBelow':
      return encodeShortLabelJumpInstructionBitAnnotations(0b0111_0011, instruction);

    case 'jeJumpOnEqual':
      return encodeShortLabelJumpInstructionBitAnnotations(0b0111_0100, instruction);

    case 'jneJumpOnNotEqual':
      return encodeShortLabelJumpInstructionBitAnnotations(0b0111_0101, instruction);

    case 'jnaJumpOnNotAbove':
      return encodeShortLabelJumpInstructionBitAnnotations(0b0111_0110, instruction);

    case 'jaJumpOnAbove':
      return encodeShortLabelJumpInstructionBitAnnotations(0b0111_0111, instruction);

    case 'jsJumpOnSign':
      return encodeShortLabelJumpInstructionBitAnnotations(0b0111_1000, instruction);

    case 'jnsJumpOnNotSign':
      return encodeShortLabelJumpInstructionBitAnnotations(0b0111_1001, instruction);

    case 'jpJumpOnParity':
      return encodeShortLabelJumpInstructionBitAnnotations(0b0111_1010, instruction);

    case 'jnpJumpOnNotParity':
      return encodeShortLabelJumpInstructionBitAnnotations(0b0111_1011, instruction);

    case 'jlJumpOnLess':
      return encodeShortLabelJumpInstructionBitAnnotations(0b0111_1100, instruction);

    case 'jnlJumpOnNotLess':
      return encodeShortLabelJumpInstructionBitAnnotations(0b0111_1101, instruction);

    case 'jngJumpOnNotGreater':
      return encodeShortLabelJumpInstructionBitAnnotations(0b0111_1110, instruction);

    case 'jgJumpOnGreater':
      return encodeShortLabelJumpInstructionBitAnnotations(0b0111_1111, instruction);

    case 'addImmediateToRegisterMemory':
      return encodeStandardArithmeticLogicImmediateToRegisterMemoryInstructionBitAnnotations(
        0b000,
        instruction,
      );

    case 'orImmediateToRegisterMemory':
      return encodeStandardArithmeticLogicImmediateToRegisterMemoryInstructionBitAnnotations(
        0b001,
        instruction,
      );

    case 'adcImmediateToRegisterMemory':
      return encodeStandardArithmeticLogicImmediateToRegisterMemoryInstructionBitAnnotations(
        0b010,
        instruction,
      );

    case 'sbbImmediateToRegisterMemory':
      return encodeStandardArithmeticLogicImmediateToRegisterMemoryInstructionBitAnnotations(
        0b011,
        instruction,
      );

    case 'andImmediateToRegisterMemory':
      return encodeStandardArithmeticLogicImmediateToRegisterMemoryInstructionBitAnnotations(
        0b100,
        instruction,
      );

    case 'subImmediateToRegisterMemory':
      return encodeStandardArithmeticLogicImmediateToRegisterMemoryInstructionBitAnnotations(
        0b101,
        instruction,
      );

    case 'xorImmediateToRegisterMemory':
      return encodeStandardArithmeticLogicImmediateToRegisterMemoryInstructionBitAnnotations(
        0b110,
        instruction,
      );

    case 'cmpImmediateToRegisterMemory':
      return encodeStandardArithmeticLogicImmediateToRegisterMemoryInstructionBitAnnotations(
        0b111,
        instruction,
      );

    default:
      return [];
  }
}

function encodeModRegRmInstructionBitAnnotations(
  opCode: number,
  instruction: {
    op1: RegisterOrEac;
    op2: RegisterOrEac;
  },
): ReadonlyArray<AnnotatedBits> {
  if (instruction.op1.kind === 'reg' && instruction.op2.kind === 'reg') {
    const destRegData = registerEncodingTable[instruction.op1.register];
    const sourceRegData = registerEncodingTable[instruction.op2.register];

    return [
      {
        category: 'opCode',
        value: opCode,
        length: 6,
      },
      {
        category: 'dBit',
        value: 0,
        length: 1,
      },
      {
        category: 'wBit',
        value: destRegData.word ? 1 : 0,
        length: 1,
      },
      {
        category: 'mod',
        value: 0b11,
        length: 2,
      },
      {
        category: 'reg',
        value: destRegData.regBits,
        length: 3,
      },
      {
        category: 'rm',
        value: sourceRegData.regBits,
        length: 3,
      },
    ];
  } else {
    const dBitAnnotation: AnnotatedBits = {
      category: 'dBit',
      value: instruction.op1.kind === 'reg' ? 1 : 0,
      length: 1,
    };

    const memoryOperand = instruction.op1.kind === 'reg' ? instruction.op2 : instruction.op1;
    const registerOperand = instruction.op1.kind === 'reg' ? instruction.op1 : instruction.op2;
    if (memoryOperand.kind === 'reg' || registerOperand.kind === 'mem') {
      throw Error(
        'Internal error: Both operands were reg or mem when they were expected to be different kinds.',
      );
    }

    const regData = registerEncodingTable[registerOperand.register];

    const wBitAnnotation: AnnotatedBits = {
      category: 'wBit',
      value: regData.word ? 1 : 0,
      length: 1,
    };

    const {
      mod: modAnnotation,
      rm: rmAnnotation,
      displacement: displacementAnnotations,
    } = encodeModRmDisplacementBitAnnotationsForMemoryOperand(memoryOperand);

    const annotatedBits: ReadonlyArray<AnnotatedBits> = [
      {
        category: 'opCode',
        value: opCode,
        length: 6,
      },
      dBitAnnotation,
      wBitAnnotation,
      modAnnotation,
      {
        category: 'reg',
        value: regData.regBits,
        length: 3,
      },
      rmAnnotation,
      ...displacementAnnotations,
    ];

    if (memoryOperand.segmentOverridePrefix === undefined) {
      return annotatedBits;
    }

    return [
      {
        category: 'segmentOverridePrefixCode',
        value: 0b001,
        length: 3,
        linkedPartIndices: [2],
      },
      encodeSegmentRegisterBitAnnotation(memoryOperand.segmentOverridePrefix),
      {
        category: 'segmentOverridePrefixCode',
        value: 0b110,
        length: 3,
        linkedPartIndices: [0],
      },
      ...annotatedBits,
    ];
  }
}

function encodeSegmentOverridePrefixBitAnnotations(
  segmentRegister: SegmentRegister,
): ReadonlyArray<AnnotatedBits> {
  return [
    {
      category: 'segmentOverridePrefixCode',
      value: 0b001,
      length: 3,
      linkedPartIndices: [2],
    },
    encodeSegmentRegisterBitAnnotation(segmentRegister),
    {
      category: 'segmentOverridePrefixCode',
      value: 0b110,
      length: 3,
      linkedPartIndices: [0],
    },
  ];
}

function encodeStandardArithmeticLogicImmediateToRegisterMemoryInstructionBitAnnotations(
  opCodePart2: number,
  instruction: {
    op1: RegisterOrEac;
    op2: number;
  },
): ReadonlyArray<AnnotatedBits> {
  const opCodePart1Annotation: AnnotatedBits = {
    category: 'opCode',
    value: 0b1000_00,
    length: 6,
    linkedPartIndices: [3],
  };

  const opCodePart2Annotation: AnnotatedBits = {
    category: 'opCode',
    value: opCodePart2,
    length: 3,
    linkedPartIndices: [0],
  };

  const sBitAnnotation: AnnotatedBits = {
    category: 'sBit',
    value: instruction.op2 >= -128 && instruction.op2 < 0 ? 1 : 0,
    length: 1,
  };

  if (instruction.op1.kind === 'reg') {
    const regData = registerEncodingTable[instruction.op1.register];

    return [
      opCodePart1Annotation,
      sBitAnnotation,
      {
        category: 'wBit',
        value: regData.word ? 1 : 0,
        length: 1,
      },
      {
        category: 'mod',
        value: 0b11,
        length: 2,
      },
      opCodePart2Annotation,
      {
        category: 'rm',
        value: regData.regBits,
        length: 3,
      },
      ...encodeDataBitAnnotations(regData.word, instruction.op2),
    ];
  } else {
    const word = instruction.op1.length === 2;

    const wBitAnnotation: AnnotatedBits = {
      category: 'wBit',
      value: word ? 1 : 0,
      length: 1,
    };

    const {
      mod: modAnnotation,
      rm: rmAnnotation,
      displacement: displacementAnnotations,
    } = encodeModRmDisplacementBitAnnotationsForMemoryOperand(instruction.op1);

    if (instruction.op1.segmentOverridePrefix) {
      return [
        ...encodeSegmentOverridePrefixBitAnnotations(instruction.op1.segmentOverridePrefix),
        sBitAnnotation,
        {
          ...opCodePart1Annotation,
          linkedPartIndices: [6],
        },
        wBitAnnotation,
        modAnnotation,
        {
          ...opCodePart2Annotation,
          linkedPartIndices: [3],
        },
        rmAnnotation,
        ...displacementAnnotations,
        ...encodeDataBitAnnotations(word, instruction.op2),
      ];
    } else {
      return [
        opCodePart1Annotation,
        sBitAnnotation,
        wBitAnnotation,
        modAnnotation,
        opCodePart2Annotation,
        rmAnnotation,
        ...displacementAnnotations,
        ...encodeDataBitAnnotations(word, instruction.op2),
      ];
    }
  }
}

function encodeModRmDisplacementBitAnnotationsForMemoryOperand(op: EffectiveAddressCalculation): {
  mod: AnnotatedBits;
  rm: AnnotatedBits;
  displacement: ReadonlyArray<AnnotatedBits>;
} {
  let displacementBytes: 0 | 1 | 2;
  const displacement: AnnotatedBits[] = [];
  if (op.calculationKind === 'DIRECT ADDRESS') {
    displacementBytes = 2;

    displacement.push(...encodeLoHiDisplacementBitAnnotations(op.displacement ?? 0));
  } else if (op.displacement === 0 || op.displacement === null) {
    displacementBytes = 0;
  } else if (op.displacement >= -128 && op.displacement <= 127) {
    displacementBytes = 1;
    displacement.push({
      category: 'dispLo',
      value: toTwosComplimentBits(op.displacement),
      length: 8,
    });
  } else {
    displacementBytes = 2;

    displacement.push(...encodeLoHiDisplacementBitAnnotations(op.displacement));
  }

  const memData = effectiveAddressEncodingTable[op.calculationKind][displacementBytes];

  if (memData === undefined) {
    throw Error("Internal error: couldn't find encoding data for effective address calculation.");
  }

  return {
    mod: {
      category: 'mod',
      value: memData.modBits,
      length: 2,
    },
    rm: {
      category: 'rm',
      value: memData.rmBits,
      length: 3,
    },
    displacement,
  };
}

function encodeWbitImmediateDataToAccumulatorInstructionBitAnnotations(
  opCode: number,
  instruction: {
    op1: AccumulatorRegister;
    op2: number;
  },
): ReadonlyArray<AnnotatedBits> {
  const word = instruction.op1.register === 'ax';

  return [
    {
      category: 'opCode',
      value: opCode,
      length: 7,
    },
    {
      category: 'wBit',
      value: word ? 1 : 0,
      length: 1,
    },
    ...encodeDataBitAnnotations(word, instruction.op2),
  ];
}

function encodeSegmentRegisterBitAnnotation(segmentRegister: SegmentRegister): AnnotatedBits {
  return {
    category: 'segReg',
    value: segmentRegisterEncodingTable[segmentRegister],
    length: 2,
  };
}

function encodeDirectOnWordRegisterBitAnnotations(
  opCode: number,
  instruction: {
    op1: WordRegister;
  },
): ReadonlyArray<AnnotatedBits> {
  return [
    {
      category: 'opCode',
      value: opCode,
      length: 5,
    },
    {
      category: 'reg',
      value: registerEncodingTable[instruction.op1.register].regBits,
      length: 3,
    },
  ];
}

function encodeShortLabelJumpInstructionBitAnnotations(
  opCode: number,
  instruction: {
    op1: number;
  },
): ReadonlyArray<AnnotatedBits> {
  return [
    {
      category: 'opCode',
      value: opCode,
      length: 8,
    },
    {
      category: 'ipInc8',
      value: instruction.op1,
      length: 8,
    },
  ];
}

function encodeDataBitAnnotations(word: boolean, value: number): ReadonlyArray<AnnotatedBits> {
  if (word) {
    return encodeLoHiDataBitAnnotations(value);
  } else {
    return [
      {
        category: 'dataLo',
        value: toTwosComplimentBits(value),
        length: 8,
      },
    ];
  }
}

function encodeLoHiDisplacementBitAnnotations(displacement: number): ReadonlyArray<AnnotatedBits> {
  return encodeInt16LiteralBitAnnotations(displacement, 'dispLo', 'dispHi');
}

function encodeLoHiDataBitAnnotations(data: number): ReadonlyArray<AnnotatedBits> {
  return encodeInt16LiteralBitAnnotations(data, 'dataLo', 'dataHi');
}

function encodeInt16LiteralBitAnnotations(
  value16: number,
  loCategory: 'dispLo' | 'dataLo',
  hiCategory: 'dispHi' | 'dataHi',
): ReadonlyArray<AnnotatedBits> {
  const twosComplimentBits = toTwosComplimentBits(value16);

  return [
    {
      category: loCategory,
      value: twosComplimentBits & 0xff,
      length: 8,
    },
    {
      category: hiCategory,
      value: (twosComplimentBits & 0xff00) >> 8,
      length: 8,
    },
  ];
}

function toByteString(byte: number): string {
  return toBitsString(byte, 8);
}

function toBitsString(value: number, bitLength: number): string {
  return value.toString(2).padStart(bitLength, '0');
}

function toTwosComplimentBits(val: number): number {
  if (val >= 0) {
    return val;
  }

  if (val >= -128) {
    return val + 256;
  } else {
    return val + 32768;
  }
}
