import { DecodedInstruction, RegisterOrEac } from './decoder';
import { effectiveAddressEncodingTable } from './effective-address-data';
import { registerEncodingTable } from './register-data';

export type AnnotatedBitsCategory =
  | 'opCode'
  | 'mod'
  | 'reg'
  | 'rm'
  | 'dBit'
  | 'wBit'
  | 'dispLo'
  | 'dispHi';

export interface AnnotatedBits {
  readonly bitsString: string;
  readonly category: AnnotatedBitsCategory;
}

export function encodeAsAnnotatedBits(
  instruction: DecodedInstruction,
): ReadonlyArray<AnnotatedBits> {
  switch (instruction.kind) {
    case 'addRegisterMemoryWithRegisterToEither':
      return [
        {
          category: 'opCode',
          bitsString: '000000',
        },
        ...encodeModRegRmAsAnnotatedBits(instruction),
      ];

    default:
      return [];
  }
}

function encodeModRegRmAsAnnotatedBits(instruction: {
  op1: RegisterOrEac;
  op2: RegisterOrEac;
}): ReadonlyArray<AnnotatedBits> {
  if (instruction.op1.kind === 'reg' && instruction.op2.kind === 'reg') {
    const destRegData = registerEncodingTable[instruction.op1.register];
    const sourceRegData = registerEncodingTable[instruction.op2.register];

    return [
      {
        category: 'dBit',
        bitsString: '0',
      },
      {
        category: 'wBit',
        bitsString: destRegData.word ? '1' : '0',
      },
      {
        category: 'mod',
        bitsString: '11',
      },
      {
        category: 'reg',
        bitsString: destRegData.regBitsString,
      },
      {
        category: 'rm',
        bitsString: sourceRegData.regBitsString,
      },
    ];
  } else {
    const dBitAnnotation: AnnotatedBits = {
      category: 'dBit',
      bitsString: instruction.op1.kind === 'reg' ? '1' : '0',
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
      bitsString: regData.word ? '1' : '0',
    };

    let displacementBytes: 0 | 1 | 2;
    const displacementAnnotations: AnnotatedBits[] = [];
    if (memoryOperand.calculationKind === 'DIRECT ADDRESS') {
      displacementBytes = 2;

      displacementAnnotations.push(
        ...encodeLoHiDisplacementAnnotations(memoryOperand.displacement ?? 0),
      );
    } else if (memoryOperand.displacement === 0 || memoryOperand.displacement === null) {
      displacementBytes = 0;
    } else if (memoryOperand.displacement >= -128 && memoryOperand.displacement <= 127) {
      displacementBytes = 1;
      displacementAnnotations.push({
        category: 'dispLo',
        // TODO this is wrong for negative displacement. Definitely here and maybe also for 16 bit
        bitsString: memoryOperand.displacement.toString(2).padStart(8, '0'),
      });
    } else {
      displacementBytes = 2;

      displacementAnnotations.push(
        ...encodeLoHiDisplacementAnnotations(memoryOperand.displacement),
      );
    }

    const memData = effectiveAddressEncodingTable[memoryOperand.calculationKind][displacementBytes];

    if (memData === undefined) {
      throw Error("Internal error: couldn't find encoding data for effective address calculation.");
    }

    return [
      dBitAnnotation,
      wBitAnnotation,
      {
        category: 'mod',
        bitsString: memData.modBitsString,
      },
      {
        category: 'reg',
        bitsString: regData.regBitsString,
      },
      {
        category: 'rm',
        bitsString: memData.rmBitsString,
      },
      ...displacementAnnotations,
    ];
  }
}

function encodeLoHiDisplacementAnnotations(displacement: number): ReadonlyArray<AnnotatedBits> {
  return [
    {
      category: 'dispLo',
      bitsString: (displacement & 0xff).toString(2).padStart(8, '0'),
    },
    {
      category: 'dispHi',
      bitsString: ((displacement & 0xff00) >> 8).toString(2).padStart(8, '0'),
    },
  ];
}
