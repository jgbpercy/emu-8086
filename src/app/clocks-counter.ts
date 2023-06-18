import { DecodedInstruction, EffectiveAddressCalculation, RegisterOrEac } from './decoder';
import { clReg, isWordRegister } from './register-data';

const immediateToRegisterStandardClockCount = 4;
const shortLabelJumpBaseClockCount = 4;

export interface MinClockCountEstimateSettings {
  readonly treatZeroDisplacementAsNoDisplacement?: boolean;
}

const defaultSettings: Required<MinClockCountEstimateSettings> = {
  treatZeroDisplacementAsNoDisplacement: true,
};

export function getMinClockCountEstimate(
  instruction: DecodedInstruction,
  settings: MinClockCountEstimateSettings = defaultSettings,
): number {
  const _settings: Required<MinClockCountEstimateSettings> = { ...defaultSettings, ...settings };

  let clocks = getMinClockCountEstimateWithoutLock(instruction, _settings);

  if ('lock' in instruction && instruction.lock) {
    clocks += 2;
  }

  return clocks;
}

export function getMinClockCountEstimateWithoutLock(
  instruction: DecodedInstruction,
  settings: Required<MinClockCountEstimateSettings>,
): number {
  switch (instruction.kind) {
    case 'addRegisterMemoryWithRegisterToEither':
    case 'orRegisterMemoryAndRegisterToEither':
    case 'adcRegisterMemoryWithRegisterToEither':
    case 'sbbRegisterMemoryAndRegisterToEither':
    case 'andRegisterMemoryWithRegisterToEither':
    case 'subRegisterMemoryAndRegisterToEither':
    case 'xorRegisterMemoryAndRegisterToEither':
      return getStandardRegisterMemoryAndRegisterClockCount(instruction, settings);

    case 'cmpRegisterMemoryAndRegister':
      return getNonStandardRegisterMemoryAndRegisterClockCount(
        instruction,
        {
          regReg: 3,
          regMem: 9,
          memReg: 9,
        },
        settings,
      );

    case 'addImmediateToAccumulator':
    case 'orImmediateToAccumulator':
    case 'adcImmediateToAccumulator':
    case 'sbbImmediateFromAccumulator':
    case 'andImmediateToAccumulator':
    case 'subImmediateFromAccumulator':
    case 'xorImmediateToAccumulator':
    case 'cmpImmediateWithAccumulator':
      return immediateToRegisterStandardClockCount;

    case 'pushSegmentRegister':
      return 10;

    case 'popSegmentRegister':
      return 8;

    case 'daaDecimalAdjustForAdd':
      return 4;

    case 'dasDecimalAdjustForSubtract':
      return 4;

    case 'aaaAsciiAdjustForAdd':
      return 4;

    case 'aasAsciiAdjustForSubtract':
      return 4;

    case 'incRegister':
      return 2;

    case 'decRegister':
      return 2;

    case 'pushRegister':
      return 11;

    case 'popRegister':
      return 8;

    case 'joJumpOnOverflow':
    case 'jnoJumpOnNotOverflow':
    case 'jbJumpOnBelow':
    case 'jnbJumpOnNotBelow':
    case 'jeJumpOnEqual':
    case 'jneJumpOnNotEqual':
    case 'jnaJumpOnNotAbove':
    case 'jaJumpOnAbove':
    case 'jsJumpOnSign':
    case 'jnsJumpOnNotSign':
    case 'jpJumpOnParity':
    case 'jnpJumpOnNotParity':
    case 'jlJumpOnLess':
    case 'jnlJumpOnNotLess':
    case 'jngJumpOnNotGreater':
    case 'jgJumpOnGreater':
      return shortLabelJumpBaseClockCount;

    case 'addImmediateToRegisterMemory':
    case 'orImmediateToRegisterMemory':
    case 'adcImmediateToRegisterMemory':
    case 'sbbImmediateToRegisterMemory':
    case 'andImmediateToRegisterMemory':
    case 'subImmediateToRegisterMemory':
    case 'xorImmediateToRegisterMemory':
      return getStandardImmediateToRegisterMemoryClockCount(instruction, settings);

    case 'cmpImmediateToRegisterMemory': {
      if (instruction.op1.kind === 'reg') {
        return immediateToRegisterStandardClockCount;
      } else {
        return 10 + getEacClockCount(instruction.op1, settings);
      }
    }

    case 'testRegisterMemoryAndRegister':
      // 4-13 claims that the first operand of this test encoding is reg/mem,
      // while 2-21 claims the first operand is always register and the second is reg/mem
      // At time of writing this comment the decoder throws if we see a mem source (second) operand
      // Whatever the case, 2-21 seems to be pretty clearly saying that a reg operand
      // and a mem operand have clock count 9
      return getNonStandardRegisterMemoryAndRegisterClockCount(
        instruction,
        {
          regReg: 3,
          memReg: 9,
          regMem: 9,
        },
        settings,
      );

    case 'xchgRegisterMemoryWithRegister':
      return getNonStandardRegisterMemoryAndRegisterClockCount(
        instruction,
        {
          regReg: 3,
          memReg: 17,
          regMem: 17,
        },
        settings,
      );

    case 'movRegisterMemoryToFromRegister':
      return getNonStandardRegisterMemoryAndRegisterClockCount(
        instruction,
        {
          regReg: 2,
          regMem: 8,
          memReg: 9,
        },
        settings,
      );

    case 'movSegmentRegisterToRegisterMemory':
      return instruction.op1.kind === 'reg' ? 2 : 9 + getEacClockCount(instruction.op1, settings);

    case 'leaLoadEaToRegister':
      return 2 + getEacClockCount(instruction.op2, settings);

    case 'movRegisterMemoryToSegmentRegister':
      return instruction.op2.kind === 'reg' ? 2 : 8 + getEacClockCount(instruction.op2, settings);

    case 'popRegisterMemory': {
      if (instruction.op1.kind === 'reg') {
        return 8;
      } else {
        return 17 + getEacClockCount(instruction.op1, settings);
      }
    }

    case 'xchgRegisterWithAccumulator':
      return 3;

    case 'cbwConvertByteToWord':
      return 2;

    case 'cwdConvertWordToDoubleWord':
      return 5;

    case 'callDirectIntersegment':
      return 28;

    case 'wait':
      // 🤷
      return 3;

    case 'pushfPushFlags':
      return 10;

    case 'popfPopFlags':
      return 8;

    case 'sahfStoreAhIntoFlags':
      return 4;

    case 'lahfLoadAhWithFlags':
      return 4;

    case 'movMemoryToAccumulator':
      return 10;

    case 'movAccumulatorToMemory':
      return 10;

    case 'movsMoveByteWord':
      return instruction.rep ? 9 : 18;

    case 'cmpsCompareByteWord':
      return instruction.rep ? 9 : 22;

    case 'testImmediateWithAccumulator':
      return 4;

    case 'stosStoreByteWordFromAlAx':
      return instruction.rep ? 9 : 11;

    case 'lodsLoadByteWordFromAlAx':
      return instruction.rep ? 9 : 12;

    case 'scasScanByteWord':
      return instruction.rep ? 9 : 15;

    case 'movImmediateToRegister':
      return 4;

    case 'retWithinSegAddingImmedToSp':
      return 12;

    case 'retWithinSegment':
      return 8;

    case 'lesLoadPointerToEs':
      return 16 + getEacClockCount(instruction.op2, settings);

    case 'ldsLoadPointerToDs':
      return 16 + getEacClockCount(instruction.op2, settings);

    case 'movImmediateToRegisterMemory':
      return instruction.op1.kind === 'reg'
        ? immediateToRegisterStandardClockCount
        : 10 + getEacClockCount(instruction.op1, settings);

    case 'retIntersegmentAddingImmediateToSp':
      // Manual claims that inter-segment with pop is cheaper than without pop? :/
      return 17;

    case 'retIntersegment':
      return 18;

    case 'intType3':
      return 52;

    case 'intTypeSpecified':
      return 51;

    case 'intoInterruptOnOverflow':
      return 4;

    case 'iretInterruptReturn':
      return 24;

    case 'rolRotateLeft':
    case 'rorRotateRight':
    case 'rclRotateThroughCarryFlagLeft':
    case 'rcrRotateThroughCarryRight':
    case 'salShiftLogicalArithmeticLeft':
    case 'shrShiftLogicalRight':
    case 'sarShiftArithmeticRight':
      return getLogicWithOneOrClClockCount(instruction, settings);

    case 'aamAsciiAdjustForMultiply':
      return 83;

    case 'aadAsciiAdjustForDivide':
      return 60;

    case 'xlatTranslateByteToAl':
      return 11;

    case 'escEscapeToExternalDevice':
      return instruction.op2.kind === 'reg' ? 2 : 8 + getEacClockCount(instruction.op2, settings);

    case 'loopneLoopWhileNotEqual':
      return 5;

    case 'loopeLoopWhileEqual':
      return 6;

    case 'loopLoopCxTimes':
      return 5;

    case 'jcxzJumpOnCxZero':
      return 6;

    case 'inFixedPort':
    case 'outFixedPort':
      return 10;

    case 'callDirectWithinSegment':
      return 19;

    case 'jmpDirectWithinSegment':
    case 'jmpDirectIntersegment':
    case 'jmpDirectWithinSegmentShort':
      return 15;

    case 'inVariablePort':
    case 'outVariablePort':
      return 8;

    case 'hltHalt':
      return 2;

    case 'cmcComplementCarry':
      return 2;

    case 'testImmediateDataAndRegisterMemory':
      return instruction.op1.kind === 'reg' ? 5 : 11 + getEacClockCount(instruction.op1, settings);

    case 'notInvert':
      return instruction.op1.kind === 'reg' ? 3 : 16 + getEacClockCount(instruction.op1, settings);

    case 'negChangeSign':
      return instruction.op1.kind === 'reg' ? 3 : 16 + getEacClockCount(instruction.op1, settings);

    case 'mulMultiplyUnsigned':
      return getMultiplyDivideClockCount(
        instruction,
        {
          reg8: 70,
          reg16: 118,
          mem8: 76,
          mem16: 124,
        },
        settings,
      );

    case 'imulIntegerMultiplySigned':
      return getMultiplyDivideClockCount(
        instruction,
        {
          reg8: 80,
          reg16: 128,
          mem8: 86,
          mem16: 134,
        },
        settings,
      );

    case 'divDivideUnsigned':
      return getMultiplyDivideClockCount(
        instruction,
        {
          reg8: 80,
          reg16: 114,
          mem8: 86,
          mem16: 150,
        },
        settings,
      );

    case 'idivIntegerDivideSigned':
      return getMultiplyDivideClockCount(
        instruction,
        {
          reg8: 101,
          reg16: 165,
          mem8: 107,
          mem16: 171,
        },
        settings,
      );

    case 'clcClearCarry':
    case 'stcSetCarry':
    case 'cliClearInterrupt':
    case 'stiSetInterrupt':
    case 'cldClearDirection':
    case 'stdSetDirection':
      return 2;

    case 'incRegisterMemory':
    case 'decRegisterMemory': {
      if (instruction.op1.kind === 'reg') {
        return isWordRegister(instruction.op1) ? 2 : 3;
      } else {
        return 15 + getEacClockCount(instruction.op1, settings);
      }
    }

    case 'callIndirectWithinSegment':
      return instruction.op1.kind === 'reg' ? 16 : 21 + getEacClockCount(instruction.op1, settings);

    case 'callIndirectIntersegment':
      return 37 + getEacClockCount(instruction.op1, settings);

    case 'jmpIndirectWithinSegment':
      return instruction.op1.kind === 'reg' ? 11 : 18 + getEacClockCount(instruction.op1, settings);

    case 'jmpIndirectIntersegment':
      return 24 + getEacClockCount(instruction.op1, settings);

    case 'pushRegisterMemory':
      return instruction.op1.kind === 'reg' ? 11 : 16 + getEacClockCount(instruction.op1, settings);

    case 'NOT USED':
    case 'UNKNOWN':
      return 0;
  }
}

function getStandardRegisterMemoryAndRegisterClockCount(
  instruction: {
    readonly op1: RegisterOrEac;
    readonly op2: RegisterOrEac;
  },
  settings: Required<MinClockCountEstimateSettings>,
): number {
  return getNonStandardRegisterMemoryAndRegisterClockCount(
    instruction,
    {
      regReg: 3,
      regMem: 9,
      memReg: 16,
    },
    settings,
  );
}

function getNonStandardRegisterMemoryAndRegisterClockCount(
  instruction: {
    readonly op1: RegisterOrEac;
    readonly op2: RegisterOrEac;
  },
  baseValues: {
    readonly regReg: number;
    readonly regMem: number;
    readonly memReg: number;
  },
  settings: Required<MinClockCountEstimateSettings>,
): number {
  if (instruction.op1.kind === 'reg' && instruction.op2.kind === 'reg') {
    return baseValues.regReg;
  } else if (instruction.op1.kind === 'mem') {
    return baseValues.memReg + getEacClockCount(instruction.op1, settings);
  } else {
    if (instruction.op2.kind !== 'mem') {
      throw Error('Internal error - expected memory operand');
    }

    return baseValues.regMem + getEacClockCount(instruction.op2, settings);
  }
}

function getStandardImmediateToRegisterMemoryClockCount(
  instruction: {
    readonly op1: RegisterOrEac;
    readonly op2: number;
  },
  settings: Required<MinClockCountEstimateSettings>,
): number {
  if (instruction.op1.kind === 'reg') {
    return immediateToRegisterStandardClockCount;
  } else {
    return 17 + getEacClockCount(instruction.op1, settings);
  }
}

function getLogicWithOneOrClClockCount(
  instruction: {
    readonly op1: RegisterOrEac;
    readonly op2: 1 | typeof clReg;
  },
  settings: Required<MinClockCountEstimateSettings>,
): number {
  if (instruction.op1.kind === 'reg') {
    if (instruction.op2 === 1) {
      return 2;
    } else {
      return 8;
    }
  } else {
    const eacClocks = getEacClockCount(instruction.op1, settings);

    if (instruction.op2 === 1) {
      return 15 + eacClocks;
    } else {
      return 20 + eacClocks;
    }
  }
}

function getMultiplyDivideClockCount(
  instruction: {
    readonly op1: RegisterOrEac;
  },
  baseValues: {
    readonly reg8: number;
    readonly reg16: number;
    readonly mem8: number;
    readonly mem16: number;
  },
  settings: Required<MinClockCountEstimateSettings>,
): number {
  if (instruction.op1.kind === 'reg') {
    if (isWordRegister(instruction.op1)) {
      return baseValues.reg16;
    } else {
      return baseValues.reg8;
    }
  } else {
    const eacClocks = getEacClockCount(instruction.op1, settings);

    if (instruction.op1.length === 2) {
      return baseValues.mem16 + eacClocks;
    } else {
      return baseValues.mem8 + eacClocks;
    }
  }
}

function getEacClockCount(
  eac: EffectiveAddressCalculation,
  settings: Required<MinClockCountEstimateSettings>,
): number {
  // I think zero displacement probably gets counted as present for the purposes of clock count
  // Can't see the processor being smart enough not to do the addition if the value is there but zero
  // This matters because for bp, displacement must be encoded, because its "slot" in mod-reg-rm encoding for
  // no displacement is taken up by direct address
  // However, I might be wrong and Casey's simulator seems to treat [bp] as 5 clocks rather than 9 so...
  let noDisplacement: boolean;
  if (settings.treatZeroDisplacementAsNoDisplacement) {
    noDisplacement = eac.displacement === 0 || eac.displacement === null;
  } else {
    noDisplacement = eac.displacement === null;
  }

  let cycleCountWithoutSegmentOverride: number;
  switch (eac.calculationKind) {
    case 'DIRECT ADDRESS':
      cycleCountWithoutSegmentOverride = 6;
      break;
    case 'bx':
    case 'bp':
    case 'si':
    case 'di':
      cycleCountWithoutSegmentOverride = noDisplacement ? 5 : 9;
      break;
    case 'bp + di':
    case 'bx + si':
      cycleCountWithoutSegmentOverride = noDisplacement ? 7 : 11;
      break;
    case 'bp + si':
    case 'bx + di':
      cycleCountWithoutSegmentOverride = noDisplacement ? 8 : 12;
      break;
  }

  return eac.segmentOverridePrefix
    ? cycleCountWithoutSegmentOverride + 2
    : cycleCountWithoutSegmentOverride;
}
