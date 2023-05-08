import { DecodedInstruction, EffectiveAddressCalculation, RegisterOrEac } from './decoder';
import { effectiveAddressEncodingTable } from './effective-address-data';
import {
  AccumulatorRegister,
  Register,
  RegisterEncodingData,
  SegmentRegister,
  WordRegister,
  clReg,
  registerEncodingTable,
  segmentRegisterEncodingTable,
} from './register-data';

export type AnnotatedBitsCategory =
  | 'lockPrefix'
  | 'repPrefix'
  | 'opCode'
  | 'mod'
  | 'reg'
  | 'rm'
  | 'dBit'
  | 'wBit'
  | 'sBit'
  | 'vBit'
  | 'segReg'
  | 'segmentOverridePrefixCode'
  | 'escOpCode'
  | 'ipInc8'
  | 'ipIncLo'
  | 'ipIncHi'
  | 'ipLo'
  | 'ipHi'
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
  readonly isByteEnd: boolean;
}

const mod11Annotation: AnnotatedBits = {
  category: 'mod',
  value: 0b11,
  length: 2,
  isByteEnd: false,
};

// 6 bytes + lock OR rep (can't see anything that can have both) + segment override = 8
const maxInstructionLengthInBytes = 8;

export function encodeBytesFromAnnotatedBits(
  annotatedBits: ReadonlyArray<AnnotatedBits>,
): Uint8Array {
  const resultBytes = new Uint8Array(maxInstructionLengthInBytes);

  let byteIndex = 0;
  let positionInByte = 0;
  let currentByteValue = 0;

  for (const annotation of annotatedBits) {
    if (byteIndex >= maxInstructionLengthInBytes) {
      throw Error(
        `Something went wrong - got an instruction longer than ${maxInstructionLengthInBytes} bytes`,
      );
    }

    const shift = 8 - annotation.length - positionInByte;

    if (shift < 0) {
      throw Error(
        'Something went wrong - next annotated bits take up more of the current byte than is left',
      );
    }

    const valueInByte = annotation.value << shift;

    currentByteValue += valueInByte;

    positionInByte += annotation.length;

    if (positionInByte > 8) {
      throw Error('Something went wrong - went past the end of the byte');
    } else if (positionInByte === 8) {
      resultBytes[byteIndex] = currentByteValue;

      byteIndex += 1;
      positionInByte = 0;
      currentByteValue = 0;
    }
  }

  return resultBytes.slice(0, byteIndex);
}

export function encodeBitAnnotations(
  instruction: DecodedInstruction,
): ReadonlyArray<AnnotatedBits> {
  // TODO This is maybe a bit sloppy but it's simple and it'll do for now
  let annotatedBits = encodeBitAnnotationsWithoutLockOrRep(instruction);

  if ('lock' in instruction && instruction.lock) {
    annotatedBits = [
      {
        category: 'lockPrefix',
        value: 0b1111_0000,
        length: 8,
        isByteEnd: true,
      },
      ...annotatedBits,
    ];
  }

  if ('rep' in instruction && instruction.rep !== null) {
    annotatedBits = [
      {
        category: 'repPrefix',
        value: instruction.rep === 'repne ' ? 0b1111_0010 : 0b1111_0011,
        length: 8,
        isByteEnd: true,
      },
      ...annotatedBits,
    ];
  }

  return annotatedBits;
}

export function encodeBitAnnotationsWithoutLockOrRep(
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
          isByteEnd: false,
        },
        encodeSegmentRegister(instruction.op1),
        {
          category: 'opCode',
          value: 0b110,
          length: 3,
          isByteEnd: true,
        },
      ];

    case 'popSegmentRegister':
      return [
        {
          category: 'opCode',
          value: 0b000,
          length: 3,
          isByteEnd: false,
        },
        encodeSegmentRegister(instruction.op1),
        {
          category: 'opCode',
          value: 0b111,
          length: 3,
          isByteEnd: true,
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

    case 'daaDecimalAdjustForAdd':
      return [{ category: 'opCode', value: 0b0010_0111, length: 8, isByteEnd: true }];

    case 'subRegisterMemoryAndRegisterToEither':
      return encodeModRegRmInstructionWithVariableDest(0b0010_10, instruction);

    case 'subImmediateFromAccumulator':
      return encodeWbitImmediateDataToAccumulatorInstruction(0b0010_110, instruction);

    case 'dasDecimalAdjustForSubtract':
      return [{ category: 'opCode', value: 0b0010_1111, length: 8, isByteEnd: true }];

    case 'xorRegisterMemoryAndRegisterToEither':
      return encodeModRegRmInstructionWithVariableDest(0b0011_00, instruction);

    case 'xorImmediateToAccumulator':
      return encodeWbitImmediateDataToAccumulatorInstruction(0b0011_010, instruction);

    case 'aaaAsciiAdjustForAdd':
      return [{ category: 'opCode', value: 0b0011_0111, length: 8, isByteEnd: true }];

    case 'cmpRegisterMemoryAndRegister':
      return encodeModRegRmInstructionWithVariableDest(0b0011_10, instruction);

    case 'cmpImmediateWithAccumulator':
      return encodeWbitImmediateDataToAccumulatorInstruction(0b0011_110, instruction);

    case 'aasAsciiAdjustForSubtract':
      return [{ category: 'opCode', value: 0b0011_1111, length: 8, isByteEnd: true }];

    case 'incRegister':
      return encodeDirectOnWordRegisterInstruction(0b0100_0, instruction);

    case 'decRegister':
      return encodeDirectOnWordRegisterInstruction(0b0100_1, instruction);

    case 'pushRegister':
      return encodeDirectOnWordRegisterInstruction(0b0101_0, instruction);

    case 'popRegister':
      return encodeDirectOnWordRegisterInstruction(0b0101_1, instruction);

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
      return encodeModRegRmInstructionWithFixedDest(0b1000_010, instruction, true);

    case 'xchgRegisterMemoryWithRegister':
      return encodeModRegRmInstructionWithFixedDest(0b1000_011, instruction, false);

    case 'movRegisterMemoryToFromRegister':
      return encodeModRegRmInstructionWithVariableDest(0b1000_10, instruction);

    case 'movSegmentRegisterToRegisterMemory':
      return encodeSegmentRegisterMovInstruction(0b1000_1100, instruction.op1, instruction.op2);

    case 'leaLoadEaToRegister': {
      const opCodeAnnotation: AnnotatedBits = {
        category: 'opCode',
        value: 0b1000_1101,
        length: 8,
        isByteEnd: true,
      };

      const modRegRmDisplacementAnnotations = encodeModRegRmDisplacementForMemoryMod(
        registerEncodingTable[instruction.op1.name],
        instruction.op2,
      );

      if (instruction.op2.segmentOverridePrefix) {
        return [
          ...encodeSegmentOverridePrefix(instruction.op2.segmentOverridePrefix),
          opCodeAnnotation,
          ...modRegRmDisplacementAnnotations,
        ];
      } else {
        return [opCodeAnnotation, ...modRegRmDisplacementAnnotations];
      }
    }

    case 'movRegisterMemoryToSegmentRegister':
      return encodeSegmentRegisterMovInstruction(0b1000_1110, instruction.op2, instruction.op1);

    case 'popRegisterMemory':
      return encodeModRmNoWbitInstruction(0b1000_1111, 0b000, instruction);

    case 'xchgRegisterWithAccumulator':
      return [
        {
          category: 'opCode',
          value: 0b1001_0,
          length: 5,
          isByteEnd: false,
        },
        {
          category: 'reg',
          value: registerEncodingTable[instruction.op2.name].regBits,
          length: 3,
          isByteEnd: true,
        },
      ];

    case 'cbwConvertByteToWord':
      return [{ category: 'opCode', value: 0b1001_1000, length: 8, isByteEnd: true }];

    case 'cwdConvertWordToDoubleWord':
      return [{ category: 'opCode', value: 0b1001_1001, length: 8, isByteEnd: true }];

    case 'callDirectIntersegment':
      return [
        {
          category: 'opCode',
          value: 0b1001_1010,
          length: 8,
          isByteEnd: true,
        },
        ...encodeInt16Literal(instruction.op1, 'ipLo', 'ipHi'),
        ...encodeInt16Literal(instruction.op2, 'segLo', 'segHi'),
      ];

    case 'wait':
      return [{ category: 'opCode', value: 0b1001_1011, length: 8, isByteEnd: true }];

    case 'pushfPushFlags':
      return [{ category: 'opCode', value: 0b1001_1100, length: 8, isByteEnd: true }];

    case 'popfPopFlags':
      return [{ category: 'opCode', value: 0b1001_1101, length: 8, isByteEnd: true }];

    case 'sahfStoreAhIntoFlags':
      return [{ category: 'opCode', value: 0b1001_1110, length: 8, isByteEnd: true }];

    case 'lahfLoadAhWithFlags':
      return [{ category: 'opCode', value: 0b1001_1111, length: 8, isByteEnd: true }];

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
        {
          category: 'opCode',
          value: 0b1010_010,
          length: 7,
          isByteEnd: false,
        },
        {
          category: 'wBit',
          value: instruction.word ? 1 : 0,
          length: 1,
          isByteEnd: true,
        },
      ];

    case 'cmpsCompareByteWord':
      return [
        {
          category: 'opCode',
          value: 0b1010_011,
          length: 7,
          isByteEnd: false,
        },
        {
          category: 'wBit',
          value: instruction.word ? 1 : 0,
          length: 1,
          isByteEnd: true,
        },
      ];

    case 'testImmediateWithAccumulator': {
      const word = instruction.op1.name === 'ax';
      return [
        {
          category: 'opCode',
          value: 0b1010_100,
          length: 7,
          isByteEnd: false,
        },
        {
          category: 'wBit',
          value: word ? 1 : 0,
          length: 1,
          isByteEnd: true,
        },
        ...encodeData(word, instruction.op2),
      ];
    }

    case 'stosStoreByteWordFromAlAx':
      return [
        {
          category: 'opCode',
          value: 0b1010_101,
          length: 7,
          isByteEnd: false,
        },
        {
          category: 'wBit',
          value: instruction.word ? 1 : 0,
          length: 1,
          isByteEnd: true,
        },
      ];

    case 'lodsLoadByteWordFromAlAx':
      return [
        {
          category: 'opCode',
          value: 0b1010_110,
          length: 7,
          isByteEnd: false,
        },
        {
          category: 'wBit',
          value: instruction.word ? 1 : 0,
          length: 1,
          isByteEnd: true,
        },
      ];

    case 'scasScanByteWord':
      return [
        {
          category: 'opCode',
          value: 0b1010_111,
          length: 7,
          isByteEnd: false,
        },
        {
          category: 'wBit',
          value: instruction.word ? 1 : 0,
          length: 1,
          isByteEnd: true,
        },
      ];

    case 'movImmediateToRegister': {
      const regData = registerEncodingTable[instruction.op1.name];

      return [
        {
          category: 'opCode',
          value: 0b1011,
          length: 4,
          isByteEnd: false,
        },
        {
          category: 'wBit',
          value: regData.word ? 1 : 0,
          length: 1,
          isByteEnd: false,
        },
        {
          category: 'reg',
          value: regData.regBits,
          length: 3,
          isByteEnd: true,
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
          isByteEnd: true,
        },
        ...encodeData(true, instruction.op1),
      ];

    case 'retWithinSegment':
      return [
        {
          category: 'opCode',
          value: 0b1100_0011,
          length: 8,
          isByteEnd: true,
        },
      ];

    case 'lesLoadPointerToEs': {
      const opCodeAnnotation: AnnotatedBits = {
        category: 'opCode',
        value: 0b1100_0100,
        length: 8,
        isByteEnd: true,
      };

      const modRegRmDisplacementAnnotations = encodeModRegRmDisplacementForMemoryMod(
        registerEncodingTable[instruction.op1.name],
        instruction.op2,
      );

      if (instruction.op2.segmentOverridePrefix) {
        return [
          ...encodeSegmentOverridePrefix(instruction.op2.segmentOverridePrefix),
          opCodeAnnotation,
          ...modRegRmDisplacementAnnotations,
        ];
      } else {
        return [opCodeAnnotation, ...modRegRmDisplacementAnnotations];
      }
    }

    case 'ldsLoadPointerToDs': {
      const opCodeAnnotation: AnnotatedBits = {
        category: 'opCode',
        value: 0b1100_0101,
        length: 8,
        isByteEnd: true,
      };

      const modRegRmDisplacementAnnotations = encodeModRegRmDisplacementForMemoryMod(
        registerEncodingTable[instruction.op1.name],
        instruction.op2,
      );

      if (instruction.op2.segmentOverridePrefix) {
        return [
          ...encodeSegmentOverridePrefix(instruction.op2.segmentOverridePrefix),
          opCodeAnnotation,
          ...modRegRmDisplacementAnnotations,
        ];
      } else {
        return [opCodeAnnotation, ...modRegRmDisplacementAnnotations];
      }
    }

    case 'movImmediateToRegisterMemory': {
      const opCodePart1Annotation: AnnotatedBits = {
        category: 'opCode',
        value: 0b1100_011,
        length: 7,
        isByteEnd: false,
      };

      const opCodePart2Annotation: AnnotatedBits = {
        category: 'opCode',
        value: 0b000,
        length: 3,
        isByteEnd: false,
      };

      if (instruction.op1.kind === 'reg') {
        const regData = registerEncodingTable[instruction.op1.name];

        return [
          opCodePart1Annotation,
          {
            category: 'wBit',
            value: regData.word ? 1 : 0,
            length: 1,
            isByteEnd: true,
          },
          mod11Annotation,
          opCodePart2Annotation,
          {
            category: 'rm',
            value: regData.regBits,
            length: 3,
            isByteEnd: true,
          },
        ];
      }

      const word = instruction.op1.length === 2;

      const wBitAnnotation: AnnotatedBits = {
        category: 'wBit',
        value: word ? 1 : 0,
        length: 1,
        isByteEnd: true,
      };

      const { modAnnotation, rmAnnotation, displacementAnnotations } =
        encodeModRmDisplacementForMemoryOperand(instruction.op1);

      const annotations = [
        opCodePart1Annotation,
        wBitAnnotation,
        modAnnotation,
        opCodePart2Annotation,
        rmAnnotation,
        ...displacementAnnotations,
        ...encodeData(word, instruction.op2),
      ];

      if (instruction.op1.segmentOverridePrefix) {
        return [
          ...encodeSegmentOverridePrefix(instruction.op1.segmentOverridePrefix),
          ...annotations,
        ];
      }

      return annotations;
    }

    case 'retIntersegmentAddingImmediateToSp':
      return [
        {
          category: 'opCode',
          value: 0b1100_1010,
          length: 8,
          isByteEnd: true,
        },
        ...encodeData(true, instruction.op1),
      ];

    case 'retIntersegment':
      return [{ category: 'opCode', value: 0b1100_1011, length: 8, isByteEnd: true }];

    case 'intType3':
      return [{ category: 'opCode', value: 0b1100_1100, length: 8, isByteEnd: true }];

    case 'intTypeSpecified':
      return [
        { category: 'opCode', value: 0b1100_1101, length: 8, isByteEnd: true },
        ...encodeData(false, instruction.op1),
      ];

    case 'intoInterruptOnOverflow':
      return [{ category: 'opCode', value: 0b1100_1110, length: 8, isByteEnd: true }];

    case 'iretInterruptReturn':
      return [{ category: 'opCode', value: 0b1100_1111, length: 8, isByteEnd: true }];

    case 'rolRotateLeft':
      return encodeStandardLogicWithOneOrClInstruction(0b000, instruction);

    case 'rorRotateRight':
      return encodeStandardLogicWithOneOrClInstruction(0b001, instruction);

    case 'rclRotateThroughCarryFlagLeft':
      return encodeStandardLogicWithOneOrClInstruction(0b010, instruction);

    case 'rcrRotateThroughCarryRight':
      return encodeStandardLogicWithOneOrClInstruction(0b011, instruction);

    case 'salShiftLogicalArithmeticLeft':
      return encodeStandardLogicWithOneOrClInstruction(0b100, instruction);

    case 'shrShiftLogicalRight':
      return encodeStandardLogicWithOneOrClInstruction(0b101, instruction);

    case 'sarShiftArithmeticRight':
      return encodeStandardLogicWithOneOrClInstruction(0b111, instruction);

    case 'aamAsciiAdjustForMultiply':
      return [
        {
          category: 'opCode',
          value: 0b1101_0100,
          length: 8,
          isByteEnd: true,
        },
        {
          category: 'opCode',
          value: 0b0000_1010,
          length: 8,
          isByteEnd: true,
        },
      ];

    case 'aadAsciiAdjustForDivide':
      return [
        {
          category: 'opCode',
          value: 0b1101_0101,
          length: 8,
          isByteEnd: true,
        },
        {
          category: 'opCode',
          value: 0b0000_1010,
          length: 8,
          isByteEnd: true,
        },
      ];

    case 'xlatTranslateByteToAl':
      return [
        {
          category: 'opCode',
          length: 8,
          value: 0b1101_0111,
          isByteEnd: true,
        },
      ];

    case 'escEscapeToExternalDevice': {
      const opCodeAnnotation: AnnotatedBits = {
        category: 'opCode',
        value: 0b1101_1,
        length: 5,
        isByteEnd: false,
      };

      const escOpCodePart1Annotation: AnnotatedBits = {
        category: 'escOpCode',
        value: instruction.op1 & (0b1110_00 >> 3),
        length: 3,
        isByteEnd: true,
      };

      const escOpCodePart2Annotation: AnnotatedBits = {
        category: 'escOpCode',
        value: instruction.op1 & 0b0001_11,
        length: 3,
        isByteEnd: false,
      };

      if (instruction.op2.kind === 'reg') {
        const regData = registerEncodingTable[instruction.op2.name];

        return [
          opCodeAnnotation,
          escOpCodePart1Annotation,
          mod11Annotation,
          escOpCodePart2Annotation,
          {
            category: 'rm',
            value: regData.regBits,
            length: 3,
            isByteEnd: true,
          },
        ];
      }

      const { modAnnotation, rmAnnotation, displacementAnnotations } =
        encodeModRmDisplacementForMemoryOperand(instruction.op2);

      const annotations = [
        opCodeAnnotation,
        escOpCodePart1Annotation,
        modAnnotation,
        escOpCodePart2Annotation,
        rmAnnotation,
        ...displacementAnnotations,
      ];

      if (instruction.op2.segmentOverridePrefix) {
        return [
          ...encodeSegmentOverridePrefix(instruction.op2.segmentOverridePrefix),
          ...annotations,
        ];
      }

      return annotations;
    }

    case 'loopneLoopWhileNotEqual':
      return encodeShortLabelJumpInstruction(0b1110_0000, instruction);

    case 'loopeLoopWhileEqual':
      return encodeShortLabelJumpInstruction(0b1110_0001, instruction);

    case 'loopLoopCxTimes':
      return encodeShortLabelJumpInstruction(0b1110_0010, instruction);

    case 'jcxzJumpOnCxZero':
      return encodeShortLabelJumpInstruction(0b1110_0011, instruction);

    case 'inFixedPort':
      return encodeInOutFixedPort(0b1110_010, instruction.op1, instruction.op2);

    case 'outFixedPort':
      return encodeInOutFixedPort(0b1110_011, instruction.op2, instruction.op1);

    case 'callDirectWithinSegment':
      return encodeCallJumpDirectWithinSegment(0b1110_1000, instruction);

    case 'jmpDirectWithinSegment':
      return encodeCallJumpDirectWithinSegment(0b1110_1001, instruction);

    case 'jmpDirectIntersegment':
      return [
        {
          category: 'opCode',
          value: 0b1110_1010,
          length: 8,
          isByteEnd: true,
        },
        ...encodeInt16Literal(instruction.op1, 'ipLo', 'ipHi'),
        ...encodeInt16Literal(instruction.op2, 'segLo', 'segHi'),
      ];

    case 'jmpDirectWithinSegmentShort':
      return [
        {
          category: 'opCode',
          value: 0b1110_1011,
          length: 8,
          isByteEnd: true,
        },
        {
          category: 'ipInc8',
          value: instruction.op1,
          length: 8,
          isByteEnd: true,
        },
      ];

    case 'inVariablePort':
      return encodeInOutVariablePort(0b1110_110, instruction.op1);

    case 'outVariablePortInstruction':
      return encodeInOutVariablePort(0b1110_111, instruction.op2);

    case 'hltHalt':
      return [{ category: 'opCode', value: 0b1111_0100, length: 8, isByteEnd: true }];

    case 'cmcComplementCarry':
      return [{ category: 'opCode', value: 0b1111_0101, length: 8, isByteEnd: true }];

    case 'testImmediateDataAndRegisterMemory': {
      const opCodePart1Annotation: AnnotatedBits = {
        category: 'opCode',
        value: 0b1111_011,
        length: 7,
        isByteEnd: false,
      };

      const opCodePart2Annotation: AnnotatedBits = {
        category: 'opCode',
        value: 0b000,
        length: 3,
        isByteEnd: false,
      };

      if (instruction.op1.kind === 'reg') {
        const regData = registerEncodingTable[instruction.op1.name];

        return [
          opCodePart1Annotation,
          {
            category: 'wBit',
            value: regData.word ? 1 : 0,
            length: 1,
            isByteEnd: true,
          },
          mod11Annotation,
          opCodePart2Annotation,
          {
            category: 'rm',
            value: regData.regBits,
            length: 3,
            isByteEnd: true,
          },
          ...encodeData(regData.word, instruction.op2),
        ];
      }

      const word = instruction.op1.length === 2;

      const wBitAnnotation: AnnotatedBits = {
        category: 'wBit',
        value: word ? 1 : 0,
        length: 1,
        isByteEnd: true,
      };

      const { modAnnotation, rmAnnotation, displacementAnnotations } =
        encodeModRmDisplacementForMemoryOperand(instruction.op1);

      const annotations = [
        opCodePart1Annotation,
        wBitAnnotation,
        modAnnotation,
        opCodePart2Annotation,
        rmAnnotation,
        ...displacementAnnotations,
        ...encodeData(word, instruction.op2),
      ];

      if (instruction.op1.segmentOverridePrefix) {
        return [
          ...encodeSegmentOverridePrefix(instruction.op1.segmentOverridePrefix),
          ...annotations,
        ];
      }

      return annotations;
    }

    case 'notInvert':
      return encodeSingleOperandMathInstruction(0b1111_011, 0b010, instruction);

    case 'negChangeSign':
      return encodeSingleOperandMathInstruction(0b1111_011, 0b011, instruction);

    case 'mulMultipleUnsigned':
      return encodeSingleOperandMathInstruction(0b1111_011, 0b100, instruction);

    case 'imulIntegerMultiplySigned':
      return encodeSingleOperandMathInstruction(0b1111_011, 0b101, instruction);

    case 'divDivideUnsigned':
      return encodeSingleOperandMathInstruction(0b1111_011, 0b110, instruction);

    case 'idivIntegerDivideSigned':
      return encodeSingleOperandMathInstruction(0b1111_011, 0b111, instruction);

    case 'clcClearCarry':
      return [{ category: 'opCode', value: 0b1111_1000, length: 8, isByteEnd: true }];

    case 'stcSetCarry':
      return [{ category: 'opCode', value: 0b1111_1001, length: 8, isByteEnd: true }];

    case 'cliClearInterrupt':
      return [{ category: 'opCode', value: 0b1111_1010, length: 8, isByteEnd: true }];

    case 'stiSetInterrupt':
      return [{ category: 'opCode', value: 0b1111_1011, length: 8, isByteEnd: true }];

    case 'cldClearDirection':
      return [{ category: 'opCode', value: 0b1111_1100, length: 8, isByteEnd: true }];

    case 'stdSetDirection':
      return [{ category: 'opCode', value: 0b1111_1101, length: 8, isByteEnd: true }];

    case 'incRegisterMemory':
      return encodeSingleOperandMathInstruction(0b1111_111, 0b000, instruction);

    case 'decRegisterMemory':
      return encodeSingleOperandMathInstruction(0b1111_111, 0b001, instruction);

    case 'callIndirectWithinSegment':
      return encodeModRmNoWbitInstruction(0b1111_1111, 0b010, instruction);

    case 'callIndirectIntersegment':
      return encodeModRmNoWbitInstruction(0b1111_1111, 0b011, instruction);

    case 'jmpIndirectWithinSegment':
      return encodeModRmNoWbitInstruction(0b1111_1111, 0b100, instruction);

    case 'jmpIndirectIntersegment':
      return encodeModRmNoWbitInstruction(0b1111_1111, 0b101, instruction);

    case 'pushRegisterMemory':
      return encodeModRmNoWbitInstruction(0b1111_1111, 0b110, instruction);

    case 'NOT USED':
    case 'UNKNOWN':
      return [];
  }
}

function encodeModRmNoWbitInstruction(
  opCodePart1: 0b1111_1111 | 0b1000_1111,
  opCodePart2: number,
  instruction: {
    readonly op1: RegisterOrEac;
  },
): ReadonlyArray<AnnotatedBits> {
  const opCodePart1Annotation: AnnotatedBits = {
    category: 'opCode',
    value: opCodePart1,
    length: 8,
    isByteEnd: true,
  };

  const opCodePart2Annotation: AnnotatedBits = {
    category: 'opCode',
    value: opCodePart2,
    length: 3,
    isByteEnd: false,
  };

  if (instruction.op1.kind === 'reg') {
    const regData = registerEncodingTable[instruction.op1.name];

    return [
      opCodePart1Annotation,
      mod11Annotation,
      opCodePart2Annotation,
      {
        category: 'rm',
        value: regData.regBits,
        length: 3,
        isByteEnd: true,
      },
    ];
  }

  const { modAnnotation, rmAnnotation, displacementAnnotations } =
    encodeModRmDisplacementForMemoryOperand(instruction.op1);

  const annotations = [
    opCodePart1Annotation,
    modAnnotation,
    opCodePart2Annotation,
    rmAnnotation,
    ...displacementAnnotations,
  ];

  if (instruction.op1.segmentOverridePrefix) {
    return [...encodeSegmentOverridePrefix(instruction.op1.segmentOverridePrefix), ...annotations];
  }

  return annotations;
}

function encodeSingleOperandMathInstruction(
  opCodePart1: 0b1111_011 | 0b1111_111,
  opCodePart2: number,
  instruction: {
    readonly op1: RegisterOrEac;
  },
): ReadonlyArray<AnnotatedBits> {
  const opCodePart1Annotation: AnnotatedBits = {
    category: 'opCode',
    value: opCodePart1,
    length: 7,
    isByteEnd: false,
  };

  const opCodePart2Annotation: AnnotatedBits = {
    category: 'opCode',
    value: opCodePart2,
    length: 3,
    isByteEnd: false,
  };

  if (instruction.op1.kind === 'reg') {
    const regData = registerEncodingTable[instruction.op1.name];

    return [
      opCodePart1Annotation,
      {
        category: 'wBit',
        value: regData.word ? 1 : 0,
        length: 1,
        isByteEnd: true,
      },
      mod11Annotation,
      opCodePart2Annotation,
      {
        category: 'rm',
        value: regData.regBits,
        length: 3,
        isByteEnd: true,
      },
    ];
  }

  const word = instruction.op1.length === 2;

  const wBitAnnotation: AnnotatedBits = {
    category: 'wBit',
    value: word ? 1 : 0,
    length: 1,
    isByteEnd: true,
  };

  const { modAnnotation, rmAnnotation, displacementAnnotations } =
    encodeModRmDisplacementForMemoryOperand(instruction.op1);

  const annotations = [
    opCodePart1Annotation,
    wBitAnnotation,
    modAnnotation,
    opCodePart2Annotation,
    rmAnnotation,
    ...displacementAnnotations,
  ];

  if (instruction.op1.segmentOverridePrefix) {
    return [...encodeSegmentOverridePrefix(instruction.op1.segmentOverridePrefix), ...annotations];
  }

  return annotations;
}

function encodeCallJumpDirectWithinSegment(
  opCode: number,
  instruction: {
    readonly op1: number;
  },
): ReadonlyArray<AnnotatedBits> {
  return [
    {
      category: 'opCode',
      value: opCode,
      length: 8,
      isByteEnd: true,
    },
    ...encodeLoHiIpInc(instruction.op1),
  ];
}

function encodeInOutVariablePort(
  opCode: number,
  reg: AccumulatorRegister,
): ReadonlyArray<AnnotatedBits> {
  return [
    {
      category: 'opCode',
      value: opCode,
      length: 7,
      isByteEnd: false,
    },
    {
      category: 'wBit',
      value: reg.name === 'al' ? 0 : 1,
      length: 1,
      isByteEnd: true,
    },
  ];
}

function encodeInOutFixedPort(
  opCode: number,
  reg: AccumulatorRegister,
  data: number,
): ReadonlyArray<AnnotatedBits> {
  return [
    {
      category: 'opCode',
      value: opCode,
      length: 7,
      isByteEnd: false,
    },
    {
      category: 'wBit',
      value: reg.name === 'al' ? 0 : 1,
      length: 1,
      isByteEnd: true,
    },
    {
      category: 'dataLo',
      length: 8,
      value: data,
      isByteEnd: true,
    },
  ];
}

function encodeStandardLogicWithOneOrClInstruction(
  opCodePart2: number,
  instruction: {
    readonly op1: RegisterOrEac;
    readonly op2: 1 | typeof clReg;
  },
): ReadonlyArray<AnnotatedBits> {
  const opCodePart1Annotation: AnnotatedBits = {
    category: 'opCode',
    value: 0b1101_00,
    length: 6,
    isByteEnd: false,
  };

  const vBitAnnotation: AnnotatedBits = {
    category: 'vBit',
    value: instruction.op2 === 1 ? 0 : 1,
    length: 1,
    isByteEnd: false,
  };

  const opCodePart2Annotation: AnnotatedBits = {
    category: 'opCode',
    value: opCodePart2,
    length: 3,
    isByteEnd: false,
  };

  if (instruction.op1.kind === 'reg') {
    const regData = registerEncodingTable[instruction.op1.name];

    return [
      opCodePart1Annotation,
      vBitAnnotation,
      {
        category: 'wBit',
        value: regData.word ? 1 : 0,
        length: 1,
        isByteEnd: true,
      },
      mod11Annotation,
      opCodePart2Annotation,
      {
        category: 'rm',
        value: regData.regBits,
        length: 3,
        isByteEnd: true,
      },
    ];
  }

  const word = instruction.op1.length === 2;

  const wBitAnnotation: AnnotatedBits = {
    category: 'wBit',
    value: word ? 1 : 0,
    length: 1,
    isByteEnd: true,
  };

  const { modAnnotation, rmAnnotation, displacementAnnotations } =
    encodeModRmDisplacementForMemoryOperand(instruction.op1);

  const annotations = [
    opCodePart1Annotation,
    vBitAnnotation,
    wBitAnnotation,
    modAnnotation,
    opCodePart2Annotation,
    rmAnnotation,
    ...displacementAnnotations,
  ];

  if (instruction.op1.segmentOverridePrefix) {
    return [...encodeSegmentOverridePrefix(instruction.op1.segmentOverridePrefix), ...annotations];
  }

  return annotations;
}

function encodeModRegRmInstructionWithVariableDest(
  opCode: number,
  instruction: {
    readonly op1: RegisterOrEac;
    readonly op2: RegisterOrEac;
  },
): ReadonlyArray<AnnotatedBits> {
  const opCodeAnnotation: AnnotatedBits = {
    category: 'opCode',
    value: opCode,
    length: 6,
    isByteEnd: false,
  };

  if (instruction.op1.kind === 'reg' && instruction.op2.kind === 'reg') {
    return [
      opCodeAnnotation,
      {
        category: 'dBit',
        value: 0,
        length: 1,
        isByteEnd: false,
      },
      ...encodeWbitModRegRmForMod11(instruction.op2, instruction.op1),
    ];
  } else {
    const dBitAnnotation: AnnotatedBits = {
      category: 'dBit',
      value: instruction.op1.kind === 'reg' ? 1 : 0,
      length: 1,
      isByteEnd: false,
    };

    const { registerOperand, memoryOperand } = getRegisterMemoryOperands(instruction);

    if (memoryOperand.segmentOverridePrefix) {
      return [
        ...encodeSegmentOverridePrefix(memoryOperand.segmentOverridePrefix),
        opCodeAnnotation,
        dBitAnnotation,
        ...encodeWbitModRegRmForMemoryMod(registerOperand, memoryOperand),
      ];
    } else {
      return [
        opCodeAnnotation,
        dBitAnnotation,
        ...encodeWbitModRegRmForMemoryMod(registerOperand, memoryOperand),
      ];
    }
  }
}

function encodeModRegRmInstructionWithFixedDest(
  opCode: number,
  instruction: {
    readonly op1: RegisterOrEac;
    readonly op2: RegisterOrEac;
  },
  // Hack to match nasm, which seems to put the dest in reg for test but not xchg?
  // Or I got something wrong elsewhere
  // Anyway I believe the order shouldn't matter for the instructions that use this
  switchRegisterOpOrder: boolean,
): ReadonlyArray<AnnotatedBits> {
  const opCodeAnnotation: AnnotatedBits = {
    category: 'opCode',
    value: opCode,
    length: 7,
    isByteEnd: false,
  };

  if (instruction.op1.kind === 'reg' && instruction.op2.kind === 'reg') {
    return [
      opCodeAnnotation,
      ...(switchRegisterOpOrder
        ? encodeWbitModRegRmForMod11(instruction.op2, instruction.op1)
        : encodeWbitModRegRmForMod11(instruction.op1, instruction.op2)),
    ];
  } else {
    const { registerOperand, memoryOperand } = getRegisterMemoryOperands(instruction);

    if (memoryOperand.segmentOverridePrefix) {
      return [
        ...encodeSegmentOverridePrefix(memoryOperand.segmentOverridePrefix),
        opCodeAnnotation,
        ...encodeWbitModRegRmForMemoryMod(registerOperand, memoryOperand),
      ];
    } else {
      return [opCodeAnnotation, ...encodeWbitModRegRmForMemoryMod(registerOperand, memoryOperand)];
    }
  }
}

function encodeWbitModRegRmForMod11(
  regField: Register,
  rmField: Register,
): ReadonlyArray<AnnotatedBits> {
  const regRegisterData = registerEncodingTable[regField.name];
  const rmRegisterData = registerEncodingTable[rmField.name];

  return [
    {
      category: 'wBit',
      value: regRegisterData.word ? 1 : 0,
      length: 1,
      isByteEnd: true,
    },
    mod11Annotation,
    {
      category: 'reg',
      value: regRegisterData.regBits,
      length: 3,
      isByteEnd: false,
    },
    {
      category: 'rm',
      value: rmRegisterData.regBits,
      length: 3,
      isByteEnd: true,
    },
  ];
}

function encodeWbitModRegRmForMemoryMod(
  registerOperand: Register,
  memoryOperand: EffectiveAddressCalculation,
): ReadonlyArray<AnnotatedBits> {
  const regData = registerEncodingTable[registerOperand.name];

  const wBitAnnotation: AnnotatedBits = {
    category: 'wBit',
    value: regData.word ? 1 : 0,
    length: 1,
    isByteEnd: true,
  };

  return [wBitAnnotation, ...encodeModRegRmDisplacementForMemoryMod(regData, memoryOperand)];
}

function getRegisterMemoryOperands(instruction: {
  readonly op1: RegisterOrEac;
  readonly op2: RegisterOrEac;
}): {
  registerOperand: Register;
  memoryOperand: EffectiveAddressCalculation;
} {
  const memoryOperand = instruction.op1.kind === 'reg' ? instruction.op2 : instruction.op1;
  const registerOperand = instruction.op1.kind === 'reg' ? instruction.op1 : instruction.op2;
  if (memoryOperand.kind === 'reg' || registerOperand.kind === 'mem') {
    throw Error(
      'Internal error: Both operands were reg or mem when they were expected to be different kinds.',
    );
  }

  return { registerOperand, memoryOperand };
}

function encodeModRegRmDisplacementForMemoryMod(
  regData: RegisterEncodingData,
  memoryOperand: EffectiveAddressCalculation,
): ReadonlyArray<AnnotatedBits> {
  const { modAnnotation, rmAnnotation, displacementAnnotations } =
    encodeModRmDisplacementForMemoryOperand(memoryOperand);

  return [
    modAnnotation,
    {
      category: 'reg',
      value: regData.regBits,
      length: 3,
      isByteEnd: false,
    },
    rmAnnotation,
    ...displacementAnnotations,
  ];
}

function encodeSegmentOverridePrefix(
  segmentRegister: SegmentRegister,
): ReadonlyArray<AnnotatedBits> {
  return [
    {
      category: 'segmentOverridePrefixCode',
      value: 0b001,
      length: 3,
      isByteEnd: false,
    },
    encodeSegmentRegister(segmentRegister),
    {
      category: 'segmentOverridePrefixCode',
      value: 0b110,
      length: 3,
      isByteEnd: true,
    },
  ];
}

function encodeStandardArithmeticLogicImmediateToRegisterMemoryInstruction(
  opCodePart2: number,
  instruction: {
    readonly op1: RegisterOrEac;
    readonly op2: number;
  },
): ReadonlyArray<AnnotatedBits> {
  const opCodePart1Annotation: AnnotatedBits = {
    category: 'opCode',
    value: 0b1000_00,
    length: 6,
    isByteEnd: false,
  };

  const opCodePart2Annotation: AnnotatedBits = {
    category: 'opCode',
    value: opCodePart2,
    length: 3,
    isByteEnd: false,
  };

  if (instruction.op1.kind === 'reg') {
    const regData = registerEncodingTable[instruction.op1.name];

    const sBit = regData.word && instruction.op2 >= -128 && instruction.op2 <= 127 ? 1 : 0;

    return [
      opCodePart1Annotation,
      {
        category: 'sBit',
        value: sBit,
        length: 1,
        isByteEnd: false,
      },
      {
        category: 'wBit',
        value: regData.word ? 1 : 0,
        length: 1,
        isByteEnd: true,
      },
      mod11Annotation,
      opCodePart2Annotation,
      {
        category: 'rm',
        value: regData.regBits,
        length: 3,
        isByteEnd: true,
      },
      ...encodeData(regData.word && !sBit, instruction.op2),
    ];
  }

  const word = instruction.op1.length === 2;

  const wBitAnnotation: AnnotatedBits = {
    category: 'wBit',
    value: word ? 1 : 0,
    length: 1,
    isByteEnd: true,
  };

  const { modAnnotation, rmAnnotation, displacementAnnotations } =
    encodeModRmDisplacementForMemoryOperand(instruction.op1);

  const sBit = word && instruction.op2 >= -128 && instruction.op2 <= 127 ? 1 : 0;

  const sBitAnnotation: AnnotatedBits = {
    category: 'sBit',
    value: sBit,
    length: 1,
    isByteEnd: false,
  };

  const dataAnnotations = encodeData(word && !sBit, instruction.op2);

  const annotations = [
    opCodePart1Annotation,
    sBitAnnotation,
    wBitAnnotation,
    modAnnotation,
    opCodePart2Annotation,
    rmAnnotation,
    ...displacementAnnotations,
    ...dataAnnotations,
  ];

  if (instruction.op1.segmentOverridePrefix) {
    return [...encodeSegmentOverridePrefix(instruction.op1.segmentOverridePrefix), ...annotations];
  }

  return annotations;
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
    isByteEnd: true,
  };

  const opCodePart2Annotation: AnnotatedBits = {
    category: 'opCode',
    value: 0,
    length: 1,
    isByteEnd: false,
  };

  const segmentRegisterAnnotation: AnnotatedBits = {
    category: 'segReg',
    value: segmentRegisterEncodingTable[segmentRegister],
    length: 2,
    isByteEnd: false,
  };

  if (registerOrEac.kind === 'reg') {
    const regData = registerEncodingTable[registerOrEac.name];

    return [
      opCodePart1Annotation,
      mod11Annotation,
      opCodePart2Annotation,
      segmentRegisterAnnotation,
      {
        category: 'rm',
        value: regData.regBits,
        length: 3,
        isByteEnd: true,
      },
    ];
  }

  const { modAnnotation, rmAnnotation, displacementAnnotations } =
    encodeModRmDisplacementForMemoryOperand(registerOrEac);

  const annotations = [
    opCodePart1Annotation,
    modAnnotation,
    opCodePart2Annotation,
    segmentRegisterAnnotation,
    rmAnnotation,
    ...displacementAnnotations,
  ];

  if (registerOrEac.segmentOverridePrefix) {
    return [...encodeSegmentOverridePrefix(registerOrEac.segmentOverridePrefix), ...annotations];
  }

  return annotations;
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
      isByteEnd: false,
    },
    {
      category: 'wBit',
      value: register.name === 'al' ? 0 : 1,
      length: 1,
      isByteEnd: true,
    },
    ...encodeLoHiDisplacement(addr),
  ];
}

function encodeModRmDisplacementForMemoryOperand(op: EffectiveAddressCalculation): {
  modAnnotation: AnnotatedBits;
  rmAnnotation: AnnotatedBits;
  displacementAnnotations: ReadonlyArray<AnnotatedBits>;
} {
  let displacementBytes: 0 | 1 | 2;
  const displacement: AnnotatedBits[] = [];
  if (op.calculationKind === 'DIRECT ADDRESS') {
    displacementBytes = 2;

    displacement.push(...encodeLoHiDisplacement(op.displacement ?? 0));
  } else if (op.displacement === 0 || op.displacement === null) {
    // Exception to the rule for bp because its mod 00 (no displacement) slot
    // is used for DIRECT ADDRESS, see table 4-10
    if (op.calculationKind === 'bp') {
      displacementBytes = 1;
      displacement.push({
        category: 'dispLo',
        value: 0,
        length: 8,
        isByteEnd: true,
      });
    } else {
      displacementBytes = 0;
    }
  } else if (op.displacement >= -128 && op.displacement <= 127) {
    displacementBytes = 1;
    displacement.push({
      category: 'dispLo',
      value: toTwosComplementBits(op.displacement),
      length: 8,
      isByteEnd: true,
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
    modAnnotation: {
      category: 'mod',
      value: memData.modBits,
      length: 2,
      isByteEnd: false,
    },
    rmAnnotation: {
      category: 'rm',
      value: memData.rmBits,
      length: 3,
      isByteEnd: true,
    },
    displacementAnnotations: displacement,
  };
}

function encodeWbitImmediateDataToAccumulatorInstruction(
  opCode: number,
  instruction: {
    readonly op1: AccumulatorRegister;
    readonly op2: number;
  },
): ReadonlyArray<AnnotatedBits> {
  const word = instruction.op1.name === 'ax';

  return [
    {
      category: 'opCode',
      value: opCode,
      length: 7,
      isByteEnd: false,
    },
    {
      category: 'wBit',
      value: word ? 1 : 0,
      length: 1,
      isByteEnd: true,
    },
    ...encodeData(word, instruction.op2),
  ];
}

function encodeSegmentRegister(segmentRegister: SegmentRegister): AnnotatedBits {
  return {
    category: 'segReg',
    value: segmentRegisterEncodingTable[segmentRegister],
    length: 2,
    isByteEnd: false,
  };
}

function encodeDirectOnWordRegisterInstruction(
  opCode: number,
  instruction: {
    readonly op1: WordRegister;
  },
): ReadonlyArray<AnnotatedBits> {
  return [
    {
      category: 'opCode',
      value: opCode,
      length: 5,
      isByteEnd: false,
    },
    {
      category: 'reg',
      value: registerEncodingTable[instruction.op1.name].regBits,
      length: 3,
      isByteEnd: true,
    },
  ];
}

function encodeShortLabelJumpInstruction(
  opCode: number,
  instruction: {
    readonly op1: number;
  },
): ReadonlyArray<AnnotatedBits> {
  return [
    {
      category: 'opCode',
      value: opCode,
      length: 8,
      isByteEnd: true,
    },
    {
      category: 'ipInc8',
      value: instruction.op1,
      length: 8,
      isByteEnd: false,
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
        value: toTwosComplementBits(value),
        length: 8,
        isByteEnd: true,
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

function encodeLoHiIpInc(data: number): ReadonlyArray<AnnotatedBits> {
  return encodeInt16Literal(data, 'ipIncLo', 'ipIncHi');
}

function encodeInt16Literal(
  value16: number,
  loCategory: 'dispLo' | 'dataLo' | 'segLo' | 'ipLo' | 'ipIncLo',
  hiCategory: 'dispHi' | 'dataHi' | 'segHi' | 'ipHi' | 'ipIncHi',
): ReadonlyArray<AnnotatedBits> {
  const twosComplementBits = toTwosComplementBits(value16);

  return [
    {
      category: loCategory,
      value: twosComplementBits & 0xff,
      length: 8,
      isByteEnd: true,
    },
    {
      category: hiCategory,
      value: (twosComplementBits & 0xff00) >> 8,
      length: 8,
      isByteEnd: true,
    },
  ];
}

function toTwosComplementBits(val: number): number {
  if (val >= 0) {
    return val;
  }

  if (val >= -128) {
    return val + 256;
  } else {
    return val + 65536;
  }
}
