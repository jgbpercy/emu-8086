import { DecodedInstruction, EffectiveAddressCalculation, RegisterOrEac } from './decoder';
import { effectiveAddressEncodingTable } from './effective-address-data';
import {
  AccumulatorRegister,
  Register,
  RegisterEncodingData,
  SegmentRegister,
  WordRegister,
  registerEncodingTable,
  segmentRegisterEncodingTable,
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
  | 'dataHi'
  | 'segLo'
  | 'segHi';

export interface AnnotatedBits {
  readonly value: number;
  readonly length: number;
  readonly category: AnnotatedBitsCategory;
  readonly linkedPartIndices?: number[];
}

const mod11Annotation: AnnotatedBits = {
  category: 'mod',
  value: 0b11,
  length: 2,
};

export function encodeBitAnnotations(
  instruction: DecodedInstruction,
): ReadonlyArray<AnnotatedBits> {
  switch (instruction.kind) {
    case 'addRegisterMemoryWithRegisterToEither':
      return encodeModRegRmInstructionWithVariableDest(0b0000_00, instruction);

    case 'addImmediateToAccumulator':
      return encodeWbitImmediateDataToAccumulatorInstruction(0b0000_010, instruction);

    case 'pushSegmentRegister':
      return [
        {
          category: 'opCode',
          value: 0b000,
          length: 3,
          linkedPartIndices: [2],
        },
        encodeSegmentRegister(instruction.op1),
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
        encodeSegmentRegister(instruction.op1),
        {
          category: 'opCode',
          value: 0b111,
          length: 3,
          linkedPartIndices: [0],
        },
      ];

    case 'orRegisterMemoryAndRegisterToEither':
      return encodeModRegRmInstructionWithVariableDest(0b0000_10, instruction);

    case 'orImmediateToAccumulator':
      return encodeWbitImmediateDataToAccumulatorInstruction(0b0000_110, instruction);

    case 'adcRegisterMemoryWithRegisterToEither':
      return encodeModRegRmInstructionWithVariableDest(0b000_100, instruction);

    case 'adcImmediateToAccumulator':
      return encodeWbitImmediateDataToAccumulatorInstruction(0b0001_010, instruction);

    case 'sbbRegisterMemoryAndRegisterToEither':
      return encodeModRegRmInstructionWithVariableDest(0b0001_10, instruction);

    case 'sbbImmediateFromAccumulator':
      return encodeWbitImmediateDataToAccumulatorInstruction(0b0001_110, instruction);

    case 'andRegisterMemoryWithRegisterToEither':
      return encodeModRegRmInstructionWithVariableDest(0b0010_00, instruction);

    case 'andImmediateToAccumulator':
      return encodeWbitImmediateDataToAccumulatorInstruction(0b0010_010, instruction);

    case 'subRegisterMemoryAndRegisterToEither':
      return encodeModRegRmInstructionWithVariableDest(0b0010_10, instruction);

    case 'subImmediateFromAccumulator':
      return encodeWbitImmediateDataToAccumulatorInstruction(0b0010_110, instruction);

    case 'xorRegisterMemoryAndRegisterToEither':
      return encodeModRegRmInstructionWithVariableDest(0b0011_00, instruction);

    case 'xorImmediateToAccumulator':
      return encodeWbitImmediateDataToAccumulatorInstruction(0b0011_010, instruction);

    case 'cmpRegisterMemoryAndRegister':
      return encodeModRegRmInstructionWithVariableDest(0b0011_10, instruction);

    case 'cmpImmediateWithAccumulator':
      return encodeWbitImmediateDataToAccumulatorInstruction(0b0011_110, instruction);

    case 'incRegister':
      return encodeDirectOnWordRegister(0b0100_0, instruction);

    case 'decRegister':
      return encodeDirectOnWordRegister(0b0100_1, instruction);

    case 'pushRegister':
      return encodeDirectOnWordRegister(0b0101_0, instruction);

    case 'popRegister':
      return encodeDirectOnWordRegister(0b0101_1, instruction);

    case 'joJumpOnOverflow':
      return encodeShortLabelJumpInstruction(0b0111_0000, instruction);

    case 'jnoJumpOnNotOverflow':
      return encodeShortLabelJumpInstruction(0b0111_0001, instruction);

    case 'jbJumpOnBelow':
      return encodeShortLabelJumpInstruction(0b0111_0010, instruction);

    case 'jnbJumpOnNotBelow':
      return encodeShortLabelJumpInstruction(0b0111_0011, instruction);

    case 'jeJumpOnEqual':
      return encodeShortLabelJumpInstruction(0b0111_0100, instruction);

    case 'jneJumpOnNotEqual':
      return encodeShortLabelJumpInstruction(0b0111_0101, instruction);

    case 'jnaJumpOnNotAbove':
      return encodeShortLabelJumpInstruction(0b0111_0110, instruction);

    case 'jaJumpOnAbove':
      return encodeShortLabelJumpInstruction(0b0111_0111, instruction);

    case 'jsJumpOnSign':
      return encodeShortLabelJumpInstruction(0b0111_1000, instruction);

    case 'jnsJumpOnNotSign':
      return encodeShortLabelJumpInstruction(0b0111_1001, instruction);

    case 'jpJumpOnParity':
      return encodeShortLabelJumpInstruction(0b0111_1010, instruction);

    case 'jnpJumpOnNotParity':
      return encodeShortLabelJumpInstruction(0b0111_1011, instruction);

    case 'jlJumpOnLess':
      return encodeShortLabelJumpInstruction(0b0111_1100, instruction);

    case 'jnlJumpOnNotLess':
      return encodeShortLabelJumpInstruction(0b0111_1101, instruction);

    case 'jngJumpOnNotGreater':
      return encodeShortLabelJumpInstruction(0b0111_1110, instruction);

    case 'jgJumpOnGreater':
      return encodeShortLabelJumpInstruction(0b0111_1111, instruction);

    case 'addImmediateToRegisterMemory':
      return encodeStandardArithmeticLogicImmediateToRegisterMemoryInstruction(0b000, instruction);

    case 'orImmediateToRegisterMemory':
      return encodeStandardArithmeticLogicImmediateToRegisterMemoryInstruction(0b001, instruction);

    case 'adcImmediateToRegisterMemory':
      return encodeStandardArithmeticLogicImmediateToRegisterMemoryInstruction(0b010, instruction);

    case 'sbbImmediateToRegisterMemory':
      return encodeStandardArithmeticLogicImmediateToRegisterMemoryInstruction(0b011, instruction);

    case 'andImmediateToRegisterMemory':
      return encodeStandardArithmeticLogicImmediateToRegisterMemoryInstruction(0b100, instruction);

    case 'subImmediateToRegisterMemory':
      return encodeStandardArithmeticLogicImmediateToRegisterMemoryInstruction(0b101, instruction);

    case 'xorImmediateToRegisterMemory':
      return encodeStandardArithmeticLogicImmediateToRegisterMemoryInstruction(0b110, instruction);

    case 'cmpImmediateToRegisterMemory':
      return encodeStandardArithmeticLogicImmediateToRegisterMemoryInstruction(0b111, instruction);

    case 'testRegisterMemoryAndRegister':
      return encodeModRegRmInstructionWithFixedDest(0b1000_010, instruction);

    case 'xchgRegisterMemoryWithRegister':
      return encodeModRegRmInstructionWithFixedDest(0b1000_011, instruction);

    case 'movRegisterMemoryToFromRegister':
      return encodeModRegRmInstructionWithVariableDest(0b1000_10, instruction);

    case 'movSegmentRegisterToRegisterMemory':
      return encodeSegmentRegisterMovInstruction(0b1000_1100, instruction.op1, instruction.op2);

    case 'leaLoadEaToRegister':
      return [
        {
          category: 'opCode',
          value: 0b1000_1101,
          length: 8,
        },
        ...encodeModRegRmDisplacementForMemoryMod(
          registerEncodingTable[instruction.op1.register],
          instruction.op2,
        ),
      ];

    case 'movRegisterMemoryToSegmentRegister':
      return encodeSegmentRegisterMovInstruction(0b1000_1110, instruction.op2, instruction.op1);

    case 'popRegisterMemory': {
      const opCodePart1Annotation: AnnotatedBits = {
        category: 'opCode',
        value: 0b1000_1111,
        length: 8,
        linkedPartIndices: [2],
      };

      const opCodePart2Annotation: AnnotatedBits = {
        category: 'opCode',
        value: 0b000,
        length: 3,
        linkedPartIndices: [0],
      };

      if (instruction.op1.kind === 'reg') {
        return [
          opCodePart1Annotation,
          mod11Annotation,
          opCodePart2Annotation,
          {
            category: 'rm',
            value: registerEncodingTable[instruction.op1.register].regBits,
            length: 3,
          },
        ];
      }

      const {
        mod: modAnnotation,
        rm: rmAnnotation,
        displacement: displacementAnnotations,
      } = encodeModRmDisplacementForMemoryOperand(instruction.op1);

      if (instruction.op1.segmentOverridePrefix) {
        return [
          ...encodeSegmentOverridePrefix(instruction.op1.segmentOverridePrefix),
          { ...opCodePart1Annotation, linkedPartIndices: [6] },
          modAnnotation,
          { ...opCodePart2Annotation, linkedPartIndices: [3] },
          rmAnnotation,
          ...displacementAnnotations,
        ];
      }

      return [
        opCodePart1Annotation,
        modAnnotation,
        opCodePart2Annotation,
        rmAnnotation,
        ...displacementAnnotations,
      ];
    }

    case 'xchgRegisterWithAccumulator':
      return [
        {
          category: 'opCode',
          value: 0b1001_1,
          length: 5,
        },
        {
          category: 'reg',
          value: registerEncodingTable[instruction.op2.register].regBits,
          length: 3,
        },
      ];

    case 'cbwConvertByteToWord':
      return [{ category: 'opCode', value: 0b1001_1000, length: 8 }];

    case 'cwdConvertWordToDoubleWord':
      return [{ category: 'opCode', value: 0b1001_1001, length: 8 }];

    case 'callDirectIntersegment':
      return [
        {
          category: 'opCode',
          value: 0b1001_1010,
          length: 8,
        },
        ...encodeInt16Literal(instruction.op1, 'dispLo', 'dispHi'),
        ...encodeInt16Literal(instruction.op2, 'segLo', 'segHi'),
      ];

    case 'wait':
      return [{ category: 'opCode', value: 0b1001_1011, length: 8 }];

    case 'pushfPushFlags':
      return [{ category: 'opCode', value: 0b1001_1100, length: 8 }];

    case 'popfPopFlags':
      return [{ category: 'opCode', value: 0b1001_1101, length: 8 }];

    case 'sahfStoreAhIntoFlags':
      return [{ category: 'opCode', value: 0b1001_1110, length: 8 }];

    case 'lahfLoadAhWithFlags':
      return [{ category: 'opCode', value: 0b1001_1111, length: 8 }];

    case 'movMemoryToAccumulator':
      return encodeMovMemoryToFromAccumulatorInstruction(
        0b1010_000,
        instruction.op1,
        instruction.op2.displacement,
      );

    case 'movAccumulatorToMemory':
      return encodeMovMemoryToFromAccumulatorInstruction(
        0b1010_001,
        instruction.op2,
        instruction.op1.displacement,
      );

    case 'movsMoveByteWord':
      return [
        { category: 'opCode', value: 0b1010_010, length: 7 },
        {
          category: 'wBit',
          value: instruction.word ? 1 : 0,
          length: 1,
        },
      ];

    case 'cmpsCompareByteWord':
      return [
        { category: 'opCode', value: 0b1010_011, length: 7 },
        {
          category: 'wBit',
          value: instruction.word ? 1 : 0,
          length: 1,
        },
      ];

    case 'testImmediateWithAccumulator': {
      const word = instruction.op1.register === 'ax';
      return [
        { category: 'opCode', value: 0b1010_100, length: 7 },
        {
          category: 'wBit',
          value: word ? 1 : 0,
          length: 1,
        },
        ...encodeData(word, instruction.op2),
      ];
    }

    case 'stosStoreByteWordFromAlAx':
      return [
        { category: 'opCode', value: 0b1010_101, length: 7 },
        {
          category: 'wBit',
          value: instruction.word ? 1 : 0,
          length: 1,
        },
      ];

    case 'lodsLoadByteWordFromAlAx':
      return [
        { category: 'opCode', value: 0b1010_110, length: 7 },
        {
          category: 'wBit',
          value: instruction.word ? 1 : 0,
          length: 1,
        },
      ];

    case 'scasScanByteWord':
      return [
        { category: 'opCode', value: 0b1010_111, length: 7 },
        {
          category: 'wBit',
          value: instruction.word ? 1 : 0,
          length: 1,
        },
      ];

    case 'movImmediateToRegister': {
      const regData = registerEncodingTable[instruction.op1.register];

      return [
        { category: 'opCode', value: 0b1011, length: 4 },
        {
          category: 'wBit',
          value: regData.word ? 1 : 0,
          length: 1,
        },
        {
          category: 'reg',
          value: regData.regBits,
          length: 3,
        },
        ...encodeData(regData.word, instruction.op2),
      ];
    }

    case 'retWithinSegAddingImmedToSp':
      return [
        {
          category: 'opCode',
          value: 0b1100_0010,
          length: 8,
        },
        ...encodeData(true, instruction.op1),
      ];

    case 'retWithinSegment':
      return [{ category: 'opCode', value: 0b1100_0011, length: 8 }];

    case 'lesLoadPointerToEs':
      return [
        {
          category: 'opCode',
          value: 0b1100_0100,
          length: 8,
        },
        ...encodeModRegRmDisplacementForMemoryMod(
          registerEncodingTable[instruction.op1.register],
          instruction.op2,
        ),
      ];

    case 'ldsLoadPointerToDs':
      return [
        {
          category: 'opCode',
          value: 0b1100_0101,
          length: 8,
        },
        ...encodeModRegRmDisplacementForMemoryMod(
          registerEncodingTable[instruction.op1.register],
          instruction.op2,
        ),
      ];

    case 'movImmediateToRegisterMemory': {
      const opCodePart1Annotation: AnnotatedBits = {
        category: 'opCode',
        value: 0b1100_011,
        length: 7,
        linkedPartIndices: [2],
      };

      const opCodePart2Annotation: AnnotatedBits = {
        category: 'opCode',
        value: 0b000,
        length: 3,
        linkedPartIndices: [0],
      };

      if (instruction.op1.kind === 'reg') {
        const regData = registerEncodingTable[instruction.op1.register];

        return [
          opCodePart1Annotation,
          {
            category: 'wBit',
            value: regData.word ? 1 : 0,
            length: 1,
          },
          mod11Annotation,
          opCodePart2Annotation,
          {
            category: 'rm',
            value: regData.regBits,
            length: 3,
          },
        ];
      }

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
      } = encodeModRmDisplacementForMemoryOperand(instruction.op1);

      if (instruction.op1.segmentOverridePrefix) {
        return [
          ...encodeSegmentOverridePrefix(instruction.op1.segmentOverridePrefix),
          {
            ...opCodePart1Annotation,
            linkedPartIndices: [5],
          },
          wBitAnnotation,
          modAnnotation,
          {
            ...opCodePart2Annotation,
            linkedPartIndices: [2],
          },
          rmAnnotation,
          ...displacementAnnotations,
          ...encodeData(word, instruction.op2),
        ];
      }

      return [
        opCodePart1Annotation,
        wBitAnnotation,
        modAnnotation,
        opCodePart2Annotation,
        rmAnnotation,
        ...displacementAnnotations,
        ...encodeData(word, instruction.op2),
      ];
    }

    case 'retIntersegmentAddingImmediateToSp':
      return [
        {
          category: 'opCode',
          value: 0b1100_1010,
          length: 8,
        },
        ...encodeData(true, instruction.op1),
      ];

    case 'retIntersegment':
      return [{ category: 'opCode', value: 0b1100_1011, length: 8 }];

    case 'intType3':
      return [{ category: 'opCode', value: 0b1100_1100, length: 8 }];

    case 'intTypeSpecified':
      return [
        { category: 'opCode', value: 0b1100_1101, length: 8 },
        ...encodeData(false, instruction.op1),
      ];

    case 'intoInterruptOnOverflow':
      return [{ category: 'opCode', value: 0b1100_1110, length: 8 }];

    case 'iretInterruptReturn':
      return [{ category: 'opCode', value: 0b1100_1111, length: 8 }];

    default:
      return [];
  }
}

function encodeModRegRmInstructionWithVariableDest(
  opCode: number,
  instruction: {
    op1: RegisterOrEac;
    op2: RegisterOrEac;
  },
): ReadonlyArray<AnnotatedBits> {
  const opCodeAnnotation: AnnotatedBits = {
    category: 'opCode',
    value: opCode,
    length: 6,
  };

  if (instruction.op1.kind === 'reg' && instruction.op2.kind === 'reg') {
    return [
      opCodeAnnotation,
      {
        category: 'dBit',
        value: 0,
        length: 1,
      },
      ...encodeWbitModRegRmForMod11(instruction.op1, instruction.op2),
    ];
  } else {
    const dBitAnnotation: AnnotatedBits = {
      category: 'dBit',
      value: instruction.op1.kind === 'reg' ? 1 : 0,
      length: 1,
    };

    return [opCodeAnnotation, dBitAnnotation, ...encodeWbitModRegRmForMemoryMod(instruction)];
  }
}

function encodeModRegRmInstructionWithFixedDest(
  opCode: number,
  instruction: {
    op1: RegisterOrEac;
    op2: RegisterOrEac;
  },
): ReadonlyArray<AnnotatedBits> {
  const opCodeAnnotation: AnnotatedBits = {
    category: 'opCode',
    value: opCode,
    length: 7,
  };

  if (instruction.op1.kind === 'reg' && instruction.op2.kind === 'reg') {
    return [opCodeAnnotation, ...encodeWbitModRegRmForMod11(instruction.op1, instruction.op2)];
  } else {
    return [opCodeAnnotation, ...encodeWbitModRegRmForMemoryMod(instruction)];
  }
}

function encodeWbitModRegRmForMod11(
  dest: Register,
  source: Register,
): ReadonlyArray<AnnotatedBits> {
  const destRegData = registerEncodingTable[dest.register];
  const sourceRegData = registerEncodingTable[source.register];

  return [
    {
      category: 'wBit',
      value: destRegData.word ? 1 : 0,
      length: 1,
    },
    mod11Annotation,
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
}

function encodeWbitModRegRmForMemoryMod(instruction: {
  op1: RegisterOrEac;
  op2: RegisterOrEac;
}): ReadonlyArray<AnnotatedBits> {
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

  return [wBitAnnotation, ...encodeModRegRmDisplacementForMemoryMod(regData, memoryOperand)];
}

function encodeModRegRmDisplacementForMemoryMod(
  regData: RegisterEncodingData,
  memoryOperand: EffectiveAddressCalculation,
): ReadonlyArray<AnnotatedBits> {
  const {
    mod: modAnnotation,
    rm: rmAnnotation,
    displacement: displacementAnnotations,
  } = encodeModRmDisplacementForMemoryOperand(memoryOperand);

  const annotatedBits: ReadonlyArray<AnnotatedBits> = [
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

  return [...encodeSegmentOverridePrefix(memoryOperand.segmentOverridePrefix), ...annotatedBits];
}

function encodeSegmentOverridePrefix(
  segmentRegister: SegmentRegister,
): ReadonlyArray<AnnotatedBits> {
  return [
    {
      category: 'segmentOverridePrefixCode',
      value: 0b001,
      length: 3,
      linkedPartIndices: [2],
    },
    encodeSegmentRegister(segmentRegister),
    {
      category: 'segmentOverridePrefixCode',
      value: 0b110,
      length: 3,
      linkedPartIndices: [0],
    },
  ];
}

function encodeStandardArithmeticLogicImmediateToRegisterMemoryInstruction(
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
      mod11Annotation,
      opCodePart2Annotation,
      {
        category: 'rm',
        value: regData.regBits,
        length: 3,
      },
      ...encodeData(regData.word, instruction.op2),
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
    } = encodeModRmDisplacementForMemoryOperand(instruction.op1);

    if (instruction.op1.segmentOverridePrefix) {
      return [
        ...encodeSegmentOverridePrefix(instruction.op1.segmentOverridePrefix),
        {
          ...opCodePart1Annotation,
          linkedPartIndices: [6],
        },
        sBitAnnotation,
        wBitAnnotation,
        modAnnotation,
        {
          ...opCodePart2Annotation,
          linkedPartIndices: [3],
        },
        rmAnnotation,
        ...displacementAnnotations,
        ...encodeData(word, instruction.op2),
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
        ...encodeData(word, instruction.op2),
      ];
    }
  }
}

function encodeSegmentRegisterMovInstruction(
  opCodePart1: number,
  registerOrEac: RegisterOrEac,
  segmentRegister: SegmentRegister,
): ReadonlyArray<AnnotatedBits> {
  const opCodePart1Annotation: AnnotatedBits = {
    category: 'opCode',
    value: opCodePart1,
    length: 8,
    linkedPartIndices: [2],
  };

  const opCodePart2Annotation: AnnotatedBits = {
    category: 'opCode',
    value: 0,
    length: 1,
    linkedPartIndices: [0],
  };

  const segmentRegisterAnnotation: AnnotatedBits = {
    category: 'segReg',
    value: segmentRegisterEncodingTable[segmentRegister],
    length: 2,
  };

  if (registerOrEac.kind === 'reg') {
    const regData = registerEncodingTable[registerOrEac.register];

    return [
      opCodePart1Annotation,
      mod11Annotation,
      opCodePart2Annotation,
      segmentRegisterAnnotation,
      {
        category: 'rm',
        value: regData.regBits,
        length: 3,
      },
    ];
  }

  const {
    mod: modAnnotation,
    rm: rmAnnotation,
    displacement: displacementAnnotations,
  } = encodeModRmDisplacementForMemoryOperand(registerOrEac);

  if (registerOrEac.segmentOverridePrefix) {
    return [
      ...encodeSegmentOverridePrefix(registerOrEac.segmentOverridePrefix),
      {
        ...opCodePart1Annotation,
        linkedPartIndices: [6],
      },
      modAnnotation,
      {
        ...opCodePart2Annotation,
        linkedPartIndices: [3],
      },
      segmentRegisterAnnotation,
      rmAnnotation,
      ...displacementAnnotations,
    ];
  }

  return [
    opCodePart1Annotation,
    modAnnotation,
    opCodePart2Annotation,
    segmentRegisterAnnotation,
    rmAnnotation,
    ...displacementAnnotations,
  ];
}

function encodeMovMemoryToFromAccumulatorInstruction(
  opCode: number,
  register: AccumulatorRegister,
  addr: number,
): ReadonlyArray<AnnotatedBits> {
  return [
    {
      category: 'opCode',
      value: opCode,
      length: 7,
    },
    {
      category: 'wBit',
      value: register.register === 'al' ? 0 : 1,
      length: 1,
    },
    ...encodeLoHiDisplacement(addr),
  ];
}

function encodeModRmDisplacementForMemoryOperand(op: EffectiveAddressCalculation): {
  mod: AnnotatedBits;
  rm: AnnotatedBits;
  displacement: ReadonlyArray<AnnotatedBits>;
} {
  let displacementBytes: 0 | 1 | 2;
  const displacement: AnnotatedBits[] = [];
  if (op.calculationKind === 'DIRECT ADDRESS') {
    displacementBytes = 2;

    displacement.push(...encodeLoHiDisplacement(op.displacement ?? 0));
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

    displacement.push(...encodeLoHiDisplacement(op.displacement));
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

function encodeWbitImmediateDataToAccumulatorInstruction(
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
    ...encodeData(word, instruction.op2),
  ];
}

function encodeSegmentRegister(segmentRegister: SegmentRegister): AnnotatedBits {
  return {
    category: 'segReg',
    value: segmentRegisterEncodingTable[segmentRegister],
    length: 2,
  };
}

function encodeDirectOnWordRegister(
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

function encodeShortLabelJumpInstruction(
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

function encodeData(word: boolean, value: number): ReadonlyArray<AnnotatedBits> {
  if (word) {
    return encodeLoHiData(value);
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

function encodeLoHiDisplacement(displacement: number): ReadonlyArray<AnnotatedBits> {
  return encodeInt16Literal(displacement, 'dispLo', 'dispHi');
}

function encodeLoHiData(data: number): ReadonlyArray<AnnotatedBits> {
  return encodeInt16Literal(data, 'dataLo', 'dataHi');
}

function encodeInt16Literal(
  value16: number,
  loCategory: 'dispLo' | 'dataLo' | 'segLo',
  hiCategory: 'dispHi' | 'dataHi' | 'segHi',
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
