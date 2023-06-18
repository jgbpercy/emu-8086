import { DecodedInstruction, EffectiveAddressCalculation, RegisterOrEac } from './decoder';
import { KeyOfType } from './key-of-type';
import { Memory, ReadonlyMemory, total8086MemorySizeInBytes } from './memory';
import {
  Register,
  SegmentRegister,
  WordRegisterName,
  alReg,
  axReg,
  isHigh8BitRegister,
  isWordRegister,
  mainRegisterTable,
} from './register-data';

interface _SimulationStatePrimatives {
  ax: number;
  bx: number;
  cx: number;
  dx: number;

  sp: number;
  bp: number;
  si: number;
  di: number;

  cs: number;
  ds: number;
  es: number;
  ss: number;

  ip: number;

  trapFlag: boolean;
  directionFlag: boolean;
  interruptFlag: boolean;
  overflowFlag: boolean;
  signFlag: boolean;
  zeroFlag: boolean;
  auxCarryFlag: boolean;
  parityFlag: boolean;
  carryFlag: boolean;
}

export type SimulationState = _SimulationStatePrimatives & {
  readonly memory: Memory;
};

export type ReadonlySimulationState = Readonly<_SimulationStatePrimatives> & {
  readonly memory: ReadonlyMemory;
};

export interface GenericSimulationStatePropertyDiff<T> {
  readonly key: KeyOfType<SimulationState, T>;
  readonly from: T;
  readonly to: T;
}

export interface MemoryDiff {
  readonly address: number;
  readonly from: number;
  readonly to: number;
}

export type SimulationStatePropertyDiff =
  | GenericSimulationStatePropertyDiff<number>
  | GenericSimulationStatePropertyDiff<boolean>
  | MemoryDiff;

export type SimulationStateDiff = ReadonlyArray<SimulationStatePropertyDiff>;

export interface SimulatedInstructionData {
  readonly diff: SimulationStateDiff;
  readonly variableClockCountEstimate: number;
}

export function simulateInstruction(
  state: SimulationState,
  instruction: DecodedInstruction,
): SimulatedInstructionData {
  const data = getSimulatedInstructionData(state, instruction);

  applyDiff(state, data.diff);

  return data;
}

const OVERFLOW_FLAG = 0b1000_0000_0000;
const DIRECTION_FLAG = 0b0100_0000_0000;
const INTERRUPT_FLAG = 0b0010_0000_0000;
const TRAP_FLAG = 0b0001_0000_0000;
const SIGN_FLAG = 0b0000_1000_0000;
const ZERO_FLAG = 0b0000_0100_0000;
const AUX_CARRY_FLAG = 0b0000_0001_0000;
const PARITY_FLAG = 0b0000_0000_0100;
const CARRY_FLAG = 0b0000_0000_0001;

function getSimulatedInstructionData(
  state: ReadonlySimulationState,
  instruction: DecodedInstruction,
): SimulatedInstructionData {
  switch (instruction.kind) {
    case 'addRegisterMemoryWithRegisterToEither': {
      const regOperand = getRegisterOperand(instruction);

      const word = isWordRegister(regOperand);

      const sourceValue = getRegisterOrEacValue(state, instruction.op2, word, 'ds');

      return makeAddDiffs(state, instruction.op1, sourceValue, word, instruction.byteLength);
    }

    case 'addImmediateToAccumulator':
      return makeAddDiffs(
        state,
        instruction.op1,
        instruction.op2,
        isWordRegister(instruction.op1),
        instruction.byteLength,
      );

    case 'pushSegmentRegister':
      return makePushDiffs(state, instruction.op1, instruction.byteLength);

    case 'popSegmentRegister':
      return makePopDiffs(state, instruction.op1, instruction.byteLength);

    case 'orRegisterMemoryAndRegisterToEither': {
      const regOperand = getRegisterOperand(instruction);

      const word = isWordRegister(regOperand);

      const sourceValue = getRegisterOrEacValue(state, instruction.op2, word, 'ds');

      return makeOrDiffs(state, instruction.op1, sourceValue, word, instruction.byteLength);
    }

    case 'orImmediateToAccumulator':
      return makeOrDiffs(
        state,
        instruction.op1,
        instruction.op2,
        isWordRegister(instruction.op1),
        instruction.byteLength,
      );

    case 'adcRegisterMemoryWithRegisterToEither': {
      const regOperand = getRegisterOperand(instruction);

      const word = isWordRegister(regOperand);

      const carry = state.carryFlag ? 1 : 0;

      const sourceValueWithCarry =
        getRegisterOrEacValue(state, instruction.op2, word, 'ds') + carry;

      return makeAddDiffs(
        state,
        instruction.op1,
        sourceValueWithCarry,
        word,
        instruction.byteLength,
      );
    }

    case 'adcImmediateToAccumulator':
      return makeAddDiffs(
        state,
        instruction.op1,
        instruction.op2 + (state.carryFlag ? 1 : 0),
        isWordRegister(instruction.op1),
        instruction.byteLength,
      );

    case 'sbbRegisterMemoryAndRegisterToEither': {
      const regOperand = getRegisterOperand(instruction);

      const word = isWordRegister(regOperand);

      const carry = state.carryFlag ? 1 : 0;

      const sourceValueWithCarry =
        getRegisterOrEacValue(state, instruction.op2, word, 'ds') + carry;

      return makeSubDiffs(
        state,
        instruction.op1,
        sourceValueWithCarry,
        word,
        instruction.byteLength,
      );
    }

    case 'sbbImmediateFromAccumulator':
      return makeSubDiffs(
        state,
        instruction.op1,
        instruction.op2 + (state.carryFlag ? 1 : 0),
        isWordRegister(instruction.op1),
        instruction.byteLength,
      );

    case 'andRegisterMemoryWithRegisterToEither': {
      const regOperand = getRegisterOperand(instruction);

      const word = isWordRegister(regOperand);

      const sourceValue = getRegisterOrEacValue(state, instruction.op2, word, 'ds');

      return makeAndDiffs(state, instruction.op1, sourceValue, word, instruction.byteLength);
    }

    case 'andImmediateToAccumulator':
      return makeAndDiffs(
        state,
        instruction.op1,
        instruction.op2,
        isWordRegister(instruction.op1),
        instruction.byteLength,
      );

    // https://www.righto.com/2023/01/understanding-x86s-decimal-adjust-after.html
    case 'daaDecimalAdjustForAdd': {
      const alLowNibbleValue = state.ax & 0x000f;
      const alValue = state.ax & 0x00ff;

      let alResult = alValue;
      let setAuxCarry = false;
      let setCarry = false;

      if (alLowNibbleValue > 9 || state.auxCarryFlag) {
        alResult += 6;
        setAuxCarry = true;
      }

      if (alValue > 0x99 || state.carryFlag) {
        alResult += 0x60;
        setCarry = true;
      }

      alResult = alResult % 256;

      const result = (state.ax & 0xff00) + alResult;

      return makeZeroVariableClockData([
        makeNextInstructionDiff(state, instruction.byteLength),
        makeSetRegisterValueDiff(state, axReg, result),
        makeSetSignFlagDiff(state, result, false),
        makeSetZeroFlagDiff(state, result),
        makeSetFlagDiff(state, 'auxCarryFlag', setAuxCarry),
        makeSetParityFlagDiff(state, result),
        makeSetFlagDiff(state, 'carryFlag', setCarry),
      ]);
    }

    case 'subRegisterMemoryAndRegisterToEither': {
      const regOperand = getRegisterOperand(instruction);

      const word = isWordRegister(regOperand);

      const sourceValue = getRegisterOrEacValue(state, instruction.op2, word, 'ds');

      return makeSubDiffs(state, instruction.op1, sourceValue, word, instruction.byteLength);
    }

    case 'subImmediateFromAccumulator':
      return makeSubDiffs(
        state,
        instruction.op1,
        instruction.op2,
        isWordRegister(instruction.op1),
        instruction.byteLength,
      );

    // https://pdos.csail.mit.edu/6.828/2005/readings/i386/DAS.htm
    case 'dasDecimalAdjustForSubtract': {
      const alLowNibbleValue = state.ax & 0x000f;
      const alValue = state.ax & 0x00ff;

      let alResult = alValue;
      let setAuxCarry = false;
      let setCarry = false;

      if (alLowNibbleValue > 9 || state.auxCarryFlag) {
        alResult -= 6;
        setAuxCarry = true;
      }

      if (alValue > 0x99 || state.carryFlag) {
        alResult -= 0x60;
        setCarry = true;
      }

      const result = (state.ax & 0xff00) + alResult;

      return makeZeroVariableClockData([
        makeNextInstructionDiff(state, instruction.byteLength),
        makeSetRegisterValueDiff(state, axReg, result),
        makeSetSignFlagDiff(state, result, false),
        makeSetZeroFlagDiff(state, result),
        makeSetFlagDiff(state, 'auxCarryFlag', setAuxCarry),
        makeSetParityFlagDiff(state, result),
        makeSetFlagDiff(state, 'carryFlag', setCarry),
      ]);
    }

    case 'xorRegisterMemoryAndRegisterToEither': {
      const regOperand = getRegisterOperand(instruction);

      const word = isWordRegister(regOperand);

      const sourceValue = getRegisterOrEacValue(state, instruction.op2, word, 'ds');

      return makeXorDiffs(state, instruction.op1, sourceValue, word, instruction.byteLength);
    }

    case 'xorImmediateToAccumulator':
      return makeXorDiffs(
        state,
        instruction.op1,
        instruction.op2,
        isWordRegister(instruction.op1),
        instruction.byteLength,
      );

    case 'aaaAsciiAdjustForAdd': {
      const alLowNibbleValue = state.ax & 0x000f;

      let setCarries = false;
      let alResult = alLowNibbleValue;
      let ahResult = state.ax & 0xff00;

      if (alLowNibbleValue > 9 || state.auxCarryFlag) {
        alResult += 6;
        ahResult += 256;
        setCarries = true;
      }

      const result = (ahResult & alResult & 0xff0f) % 65536;

      return makeZeroVariableClockData([
        makeNextInstructionDiff(state, instruction.byteLength),
        makeSetRegisterValueDiff(state, axReg, result),
        makeSetFlagDiff(state, 'auxCarryFlag', setCarries),
        makeSetFlagDiff(state, 'carryFlag', setCarries),
      ]);
    }

    case 'cmpRegisterMemoryAndRegister': {
      const regOperand = getRegisterOperand(instruction);

      const word = isWordRegister(regOperand);

      const sourceValue = getRegisterOrEacValue(state, instruction.op2, word, 'ds');

      return makeCmpDiffs(state, instruction.op1, sourceValue, word, instruction.byteLength);
    }

    case 'cmpImmediateWithAccumulator':
      return makeCmpDiffs(
        state,
        instruction.op1,
        instruction.op2,
        isWordRegister(instruction.op1),
        instruction.byteLength,
      );

    case 'aasAsciiAdjustForSubtract': {
      const alLowNibbleValue = state.ax & 0x000f;

      let setCarries = false;
      let alResult = alLowNibbleValue;
      let ahResult = state.ax & 0xff00;

      if (alLowNibbleValue > 9 || state.auxCarryFlag) {
        alResult -= 6;
        ahResult -= 256;

        if (ahResult < 0) {
          ahResult += 65536;
        }

        setCarries = true;
      }

      const result = ahResult & alResult & 0xff0f;

      return makeZeroVariableClockData([
        makeNextInstructionDiff(state, instruction.byteLength),
        makeSetRegisterValueDiff(state, axReg, result),
        makeSetFlagDiff(state, 'auxCarryFlag', setCarries),
        makeSetFlagDiff(state, 'carryFlag', setCarries),
      ]);
    }

    case 'incRegister':
      return makeAddDiffs(
        state,
        instruction.op1,
        1,
        isWordRegister(instruction.op1),
        instruction.byteLength,
        false,
      );

    case 'decRegister':
      return makeSubDiffs(
        state,
        instruction.op1,
        1,
        isWordRegister(instruction.op1),
        instruction.byteLength,
      );

    case 'pushRegister':
      return makePushDiffs(state, instruction.op1.name, instruction.byteLength);

    case 'popRegister':
      return makePopDiffs(state, instruction.op1.name, instruction.byteLength);

    case 'joJumpOnOverflow':
      return makeShortLabelJumpDiff(state, instruction, state.overflowFlag);

    case 'jnoJumpOnNotOverflow':
      return makeShortLabelJumpDiff(state, instruction, !state.overflowFlag);

    case 'jbJumpOnBelow':
      return makeShortLabelJumpDiff(state, instruction, state.carryFlag);

    case 'jnbJumpOnNotBelow':
      return makeShortLabelJumpDiff(state, instruction, !state.carryFlag);

    case 'jeJumpOnEqual':
      return makeShortLabelJumpDiff(state, instruction, state.zeroFlag);

    case 'jneJumpOnNotEqual':
      return makeShortLabelJumpDiff(state, instruction, !state.zeroFlag);

    case 'jnaJumpOnNotAbove':
      return makeShortLabelJumpDiff(state, instruction, state.carryFlag || state.overflowFlag);

    case 'jaJumpOnAbove':
      return makeShortLabelJumpDiff(state, instruction, !(state.carryFlag || state.overflowFlag));

    case 'jsJumpOnSign':
      return makeShortLabelJumpDiff(state, instruction, state.signFlag);

    case 'jnsJumpOnNotSign':
      return makeShortLabelJumpDiff(state, instruction, !state.signFlag);

    case 'jpJumpOnParity':
      return makeShortLabelJumpDiff(state, instruction, state.parityFlag);

    case 'jnpJumpOnNotParity':
      return makeShortLabelJumpDiff(state, instruction, !state.parityFlag);

    case 'jlJumpOnLess':
      return makeShortLabelJumpDiff(
        state,
        instruction,
        // XOR, technially
        state.signFlag !== state.overflowFlag,
      );

    case 'jnlJumpOnNotLess':
      return makeShortLabelJumpDiff(
        state,
        instruction,
        // !XOR
        state.signFlag === state.overflowFlag,
      );

    case 'jngJumpOnNotGreater':
      return makeShortLabelJumpDiff(
        state,
        instruction,
        state.overflowFlag !== state.signFlag || state.zeroFlag,
      );

    case 'jgJumpOnGreater':
      return makeShortLabelJumpDiff(
        state,
        instruction,
        !(state.overflowFlag !== state.signFlag || state.zeroFlag),
      );

    case 'addImmediateToRegisterMemory':
      return makeAddDiffs(
        state,
        instruction.op1,
        sanitize8BitSignExtendedNegatives(instruction.op2),
        getWordFromRegisterOrEac(instruction.op1),
        instruction.byteLength,
      );

    case 'orImmediateToRegisterMemory':
      return makeOrDiffs(
        state,
        instruction.op1,
        sanitize8BitSignExtendedNegatives(instruction.op2),
        getWordFromRegisterOrEac(instruction.op1),
        instruction.byteLength,
      );

    case 'adcImmediateToRegisterMemory': {
      const carry = state.carryFlag ? 1 : 0;

      return makeAddDiffs(
        state,
        instruction.op1,
        sanitize8BitSignExtendedNegatives(instruction.op2) + carry,
        getWordFromRegisterOrEac(instruction.op1),
        instruction.byteLength,
      );
    }

    case 'sbbImmediateToRegisterMemory': {
      const carry = state.carryFlag ? 1 : 0;

      return makeSubDiffs(
        state,
        instruction.op1,
        sanitize8BitSignExtendedNegatives(instruction.op2) + carry,
        getWordFromRegisterOrEac(instruction.op1),
        instruction.byteLength,
      );
    }

    case 'andImmediateToRegisterMemory':
      return makeAndDiffs(
        state,
        instruction.op1,
        sanitize8BitSignExtendedNegatives(instruction.op2),
        getWordFromRegisterOrEac(instruction.op1),
        instruction.byteLength,
      );

    case 'subImmediateToRegisterMemory':
      return makeSubDiffs(
        state,
        instruction.op1,
        sanitize8BitSignExtendedNegatives(instruction.op2),
        getWordFromRegisterOrEac(instruction.op1),
        instruction.byteLength,
      );

    case 'xorImmediateToRegisterMemory':
      return makeXorDiffs(
        state,
        instruction.op1,
        sanitize8BitSignExtendedNegatives(instruction.op2),
        getWordFromRegisterOrEac(instruction.op1),
        instruction.byteLength,
      );

    case 'cmpImmediateToRegisterMemory':
      return makeCmpDiffs(
        state,
        instruction.op1,
        sanitize8BitSignExtendedNegatives(instruction.op2),
        getWordFromRegisterOrEac(instruction.op1),
        instruction.byteLength,
      );

    case 'testRegisterMemoryAndRegister': {
      const regOperand = getRegisterOperand(instruction);

      const word = isWordRegister(regOperand);

      const sourceValue = getRegisterOrEacValue(state, instruction.op2, word, 'ds');

      return makeTestDiffs(state, instruction.op1, sourceValue, word, instruction.byteLength);
    }

    case 'xchgRegisterMemoryWithRegister': {
      let registerOperand: Register;
      let otherOperand: RegisterOrEac;

      if (instruction.op1.kind === 'reg') {
        registerOperand = instruction.op1;
        otherOperand = instruction.op2;
      } else {
        if (instruction.op2.kind !== 'reg') {
          throw Error('Internal Error - Two memory operands?');
        }

        registerOperand = instruction.op2;
        otherOperand = instruction.op1;
      }

      const word = isWordRegister(registerOperand);

      return makeXchgDiffs(state, registerOperand, otherOperand, word, instruction.byteLength);
    }

    case 'movRegisterMemoryToFromRegister': {
      const regOperand = getRegisterOperand(instruction);

      const word = isWordRegister(regOperand);

      const sourceValue = getRegisterOrEacValue(state, instruction.op2, word, 'ds');

      const dest = instruction.op1;

      return makeZeroVariableClockData([
        makeNextInstructionDiff(state, instruction.byteLength),
        ...makeSetRegisterOrMemoryValueDiffs(state, dest, sourceValue, word, 'ds'),
      ]);
    }

    case 'movSegmentRegisterToRegisterMemory': {
      const dest = instruction.op1;

      const sourceValue = state[instruction.op2];

      return makeZeroVariableClockData([
        makeNextInstructionDiff(state, instruction.byteLength),
        ...makeSetRegisterOrMemoryValueDiffs(state, dest, sourceValue, true, 'ds'),
      ]);
    }

    case 'leaLoadEaToRegister': {
      const sourceValue = getOffsetFromEac(state, instruction.op2);

      return makeZeroVariableClockData([
        makeNextInstructionDiff(state, instruction.byteLength),
        makeSetRegisterValueDiff(state, instruction.op1, sourceValue),
      ]);
    }

    case 'movRegisterMemoryToSegmentRegister': {
      const source = instruction.op2;

      const sourceValue = getRegisterOrEacValue(state, source, true, 'ds');

      return makeZeroVariableClockData([
        makeNextInstructionDiff(state, instruction.byteLength),
        makeSetNumberDiff(state, instruction.op1, sourceValue),
      ]);
    }

    case 'popRegisterMemory':
      return makePopDiffs(state, instruction.op1, instruction.byteLength);

    case 'xchgRegisterWithAccumulator':
      return makeXchgDiffs(state, instruction.op1, instruction.op2, true, instruction.byteLength);

    case 'cbwConvertByteToWord': {
      const alValue = state.ax & 0x00ff;

      let axResult: number;
      if (alValue >= 128) {
        axResult = 0xff00 + alValue;
      } else {
        axResult = alValue;
      }

      return makeZeroVariableClockData([
        makeNextInstructionDiff(state, instruction.byteLength),
        makeSetNumberDiff(state, 'ax', axResult),
      ]);
    }

    case 'cwdConvertWordToDoubleWord': {
      let dxResult: number;
      if (state.ax >= 32768) {
        dxResult = 0xffff;
      } else {
        dxResult = 0;
      }

      return makeZeroVariableClockData([
        makeNextInstructionDiff(state, instruction.byteLength),
        makeSetNumberDiff(state, 'dx', dxResult),
      ]);
    }

    case 'callDirectIntersegment': {
      const newSp = state.sp - 4;

      const nextInstructionIp = state.ip + instruction.byteLength;

      return makeZeroVariableClockData([
        makeSetNumberDiff(state, 'ip', instruction.op1),
        makeSetNumberDiff(state, 'cs', instruction.op2),
        makeSetNumberDiff(state, 'sp', newSp),
        ...makeSetMemoryValueDiffs(state, newSp + 2, state.cs, true),
        ...makeSetMemoryValueDiffs(state, newSp, nextInstructionIp, true),
      ]);
    }

    case 'wait': {
      return makeZeroVariableClockData([makeNextInstructionDiff(state, instruction.byteLength)]); // TODO? :p
    }

    case 'pushfPushFlags': {
      const newSp = state.sp - 2;

      const flagsValue = getFlagsValue(state);

      return makeZeroVariableClockData([
        makeNextInstructionDiff(state, instruction.byteLength),
        makeSetNumberDiff(state, 'sp', newSp),
        ...makeSetMemoryValueDiffs(state, newSp, flagsValue, true),
      ]);
    }

    case 'popfPopFlags': {
      const stackAddress = getMemoryAddress(state, state.sp, 'ss');

      const flagsValue = state.memory.readWord(stackAddress);

      const overflow = !!(flagsValue & OVERFLOW_FLAG);
      const direction = !!(flagsValue & DIRECTION_FLAG);
      const interrupt = !!(flagsValue & INTERRUPT_FLAG);
      const trap = !!(flagsValue & TRAP_FLAG);
      const sign = !!(flagsValue & SIGN_FLAG);
      const zero = !!(flagsValue & ZERO_FLAG);
      const auxCarry = !!(flagsValue & AUX_CARRY_FLAG);
      const parity = !!(flagsValue & PARITY_FLAG);
      const carry = !!(flagsValue & CARRY_FLAG);

      const newSp = state.sp + 2;

      return makeZeroVariableClockData([
        makeNextInstructionDiff(state, instruction.byteLength),
        makeSetFlagDiff(state, 'overflowFlag', overflow),
        makeSetFlagDiff(state, 'directionFlag', direction),
        makeSetFlagDiff(state, 'interruptFlag', interrupt),
        makeSetFlagDiff(state, 'trapFlag', trap),
        makeSetFlagDiff(state, 'signFlag', sign),
        makeSetFlagDiff(state, 'zeroFlag', zero),
        makeSetFlagDiff(state, 'auxCarryFlag', auxCarry),
        makeSetFlagDiff(state, 'parityFlag', parity),
        makeSetFlagDiff(state, 'carryFlag', carry),
        makeSetNumberDiff(state, 'sp', newSp),
      ]);
    }

    case 'sahfStoreAhIntoFlags': {
      const flagsValue = state.ax >> 8;

      const sign = !!(flagsValue & SIGN_FLAG);
      const zero = !!(flagsValue & ZERO_FLAG);
      const auxCarry = !!(flagsValue & AUX_CARRY_FLAG);
      const parity = !!(flagsValue & PARITY_FLAG);
      const carry = !!(flagsValue & CARRY_FLAG);

      return makeZeroVariableClockData([
        makeNextInstructionDiff(state, instruction.byteLength),
        makeSetFlagDiff(state, 'signFlag', sign),
        makeSetFlagDiff(state, 'zeroFlag', zero),
        makeSetFlagDiff(state, 'auxCarryFlag', auxCarry),
        makeSetFlagDiff(state, 'parityFlag', parity),
        makeSetFlagDiff(state, 'carryFlag', carry),
      ]);
    }

    case 'lahfLoadAhWithFlags': {
      const sign = state.signFlag ? SIGN_FLAG : 0;
      const zero = state.zeroFlag ? ZERO_FLAG : 0;
      const auxCarry = state.auxCarryFlag ? AUX_CARRY_FLAG : 0;
      const parity = state.parityFlag ? PARITY_FLAG : 0;
      const carry = state.carryFlag ? CARRY_FLAG : 0;

      const value = sign & zero & auxCarry & parity & carry;

      return makeZeroVariableClockData([
        makeNextInstructionDiff(state, instruction.byteLength),
        makeSetNumberDiff(state, 'ax', value << 8),
      ]);
    }

    case 'movMemoryToAccumulator':
      return makeZeroVariableClockData([
        makeNextInstructionDiff(state, instruction.byteLength),
        makeSetRegisterValueDiff(
          state,
          instruction.op1,
          getMemoryValueFromEac(state, instruction.op2, isWordRegister(instruction.op1), 'ds'),
        ),
      ]);

    case 'movAccumulatorToMemory':
      return makeZeroVariableClockData([
        makeNextInstructionDiff(state, instruction.byteLength),
        ...makeSetMemoryValueDiffs(
          state,
          getMemoryAddressFromEac(state, instruction.op1, 'ds'),
          getRegisterValue(state, instruction.op2),
          isWordRegister(instruction.op2),
        ),
      ]);

    case 'movsMoveByteWord': {
      if (!instruction.rep) {
        const { destAddress, sourceAddress } = getStringInstructionAddresses(state, 0);

        return makeZeroVariableClockData([
          makeNextInstructionDiff(state, instruction.byteLength),
          ...makeStringInstructionRegisterDiffs(state, 1, instruction.word),
          ...makeSetMemoryValueDiffs(
            state,
            destAddress,
            instruction.word
              ? state.memory.readWord(sourceAddress)
              : state.memory.readByte(sourceAddress),
            instruction.word,
          ),
        ]);
      } else {
        return makeZeroVariableClockData([
          makeNextInstructionDiff(state, instruction.byteLength),
          ...makeStringInstructionRegisterDiffs(state, state.cx, instruction.word),
          makeSetNumberDiff(state, 'cx', 0),
          ...makeRepMovsMemoryDiffs(state, instruction.word),
        ]);
      }
    }

    case 'cmpsCompareByteWord': {
      if (!instruction.rep) {
        const { destAddress, sourceAddress } = getStringInstructionAddresses(state, 0);

        const destValue = instruction.word
          ? state.memory.readWord(destAddress)
          : state.memory.readByte(destAddress);
        const sourceValue = instruction.word
          ? state.memory.readWord(sourceAddress)
          : state.memory.readByte(sourceAddress);

        const { flagDiffs } = makeSubOrCmpResultsWithDestValue(
          state,
          destValue,
          sourceValue,
          instruction.word,
        );

        return makeZeroVariableClockData([
          makeNextInstructionDiff(state, instruction.byteLength),
          ...makeStringInstructionRegisterDiffs(state, 1, instruction.word),
          ...flagDiffs,
        ]);
      } else {
        if (state.cx === 0) {
          return makeZeroVariableClockData([
            makeNextInstructionDiff(state, instruction.byteLength),
          ]);
        }

        let cx = state.cx;

        const zeroFlagTarget = instruction.rep === 'rep ' ? true : false;
        let zeroFlag: boolean;

        const direction = state.directionFlag ? -1 : 1;
        const size = instruction.word ? 2 : 1;

        let offset = 0;
        let destValue: number;
        let sourceValue: number;

        do {
          const { destAddress, sourceAddress } = getStringInstructionAddresses(state, offset);

          destValue = instruction.word
            ? state.memory.readWord(destAddress)
            : state.memory.readByte(destAddress);
          sourceValue = instruction.word
            ? state.memory.readWord(sourceAddress)
            : state.memory.readByte(sourceAddress);

          const result = sourceValue - destValue;

          zeroFlag = result === 0;

          cx--;

          offset = (state.cx - cx) * direction * size;
        } while (cx !== 0 && zeroFlag !== zeroFlagTarget);

        const { flagDiffs } = makeSubOrCmpResultsWithDestValue(
          state,
          destValue,
          sourceValue,
          instruction.word,
        );

        const reps = state.cx - cx;

        return {
          diff: [
            makeNextInstructionDiff(state, instruction.byteLength),
            ...makeStringInstructionRegisterDiffs(state, reps, instruction.word),
            makeSetNumberDiff(state, 'cx', cx),
            ...flagDiffs,
          ],
          variableClockCountEstimate: reps * 22,
        };
      }
    }

    case 'testImmediateWithAccumulator':
      return makeTestDiffs(
        state,
        instruction.op1,
        instruction.op2,
        isWordRegister(instruction.op1),
        instruction.byteLength,
      );

    case 'stosStoreByteWordFromAlAx': {
      const repetitions = instruction.rep ? state.cx : 1;

      const direction = state.directionFlag ? -1 : 1;
      const size = instruction.word ? 2 : 1;

      const nextInstructionDiff = makeNextInstructionDiff(state, instruction.byteLength);
      const diDiff = makeSetNumberDiff(state, 'di', repetitions * size * direction);

      let memoryDiffs: MemoryDiff[];

      if (instruction.word) {
        memoryDiffs = new Array(repetitions * 2);

        for (let i = 0; i < repetitions; i++) {
          const { destAddress } = getStringInstructionAddresses(state, i * direction);

          const diffsForThisIteration = makeSetMemoryValueDiffs(state, destAddress, state.ax, true);

          memoryDiffs[2 * i] = diffsForThisIteration.next().value;
          memoryDiffs[2 * i + 1] = diffsForThisIteration.next().value;

          if (!diffsForThisIteration.next().done) {
            throw Error('Internal error - expected end of iterator');
          }
        }
      } else {
        memoryDiffs = new Array(repetitions);

        const value = state.ax && 0x00ff;

        for (let i = 0; i < repetitions; i++) {
          const { destAddress } = getStringInstructionAddresses(state, i * direction);

          memoryDiffs[i] = makeSetMemoryValueDiff(state, destAddress, value);
        }
      }

      if (instruction.rep) {
        return {
          diff: [nextInstructionDiff, makeSetNumberDiff(state, 'cx', 0), diDiff, ...memoryDiffs],
          variableClockCountEstimate: 10 * repetitions,
        };
      } else {
        return makeZeroVariableClockData([nextInstructionDiff, diDiff, ...memoryDiffs]);
      }
    }

    case 'lodsLoadByteWordFromAlAx': {
      const repetitions = instruction.rep ? state.cx : 1;

      const direction = state.directionFlag ? -1 : 1;
      const size = instruction.word ? 2 : 1;

      const finalSi = repetitions * size * direction;

      const nextInstructionDiff = makeNextInstructionDiff(state, instruction.byteLength);
      const siDiff = makeSetNumberDiff(state, 'si', finalSi);

      const finalAddress = getMemoryAddress(state, finalSi, 'ds');

      const sourceValue = instruction.word
        ? state.memory.readWord(finalAddress)
        : state.memory.readByte(finalAddress);

      const setRegisterDiff = makeSetRegisterValueDiff(
        state,
        instruction.word ? axReg : alReg,
        sourceValue,
      );

      if (instruction.rep) {
        return {
          diff: [nextInstructionDiff, setRegisterDiff, makeSetNumberDiff(state, 'cx', 0), siDiff],
          variableClockCountEstimate: 13 * repetitions,
        };
      } else {
        return makeZeroVariableClockData([nextInstructionDiff, setRegisterDiff, siDiff]);
      }
    }

    case 'scasScanByteWord': {
      const sourceValue = instruction.word ? state.ax : state.ax & 0x00ff;

      if (!instruction.rep) {
        const { destAddress } = getStringInstructionAddresses(state, 0);

        const destValue = instruction.word
          ? state.memory.readWord(destAddress)
          : state.memory.readByte(destAddress);

        const { flagDiffs } = makeSubOrCmpResultsWithDestValue(
          state,
          destValue,
          sourceValue,
          instruction.word,
        );

        const direction = state.directionFlag ? -1 : 1;

        const size = instruction.word ? 2 : 1;

        return makeZeroVariableClockData([
          makeNextInstructionDiff(state, instruction.byteLength),
          makeSetNumberDiff(state, 'di', state.di + direction * size),
          ...flagDiffs,
        ]);
      } else {
        if (state.cx === 0) {
          return makeZeroVariableClockData([
            makeNextInstructionDiff(state, instruction.byteLength),
          ]);
        }

        let cx = state.cx;

        const zeroFlagTarget = instruction.rep === 'rep ' ? true : false;
        let zeroFlag: boolean;

        const direction = state.directionFlag ? -1 : 1;
        const size = instruction.word ? 2 : 1;

        let offset = 0;
        let destValue: number;

        do {
          const { destAddress } = getStringInstructionAddresses(state, offset);

          destValue = instruction.word
            ? state.memory.readWord(destAddress)
            : state.memory.readByte(destAddress);

          const result = sourceValue - destValue;

          zeroFlag = result === 0;

          cx--;

          offset = (state.cx - cx) * direction * size;
        } while (cx !== 0 && zeroFlag !== zeroFlagTarget);

        const { flagDiffs } = makeSubOrCmpResultsWithDestValue(
          state,
          destValue,
          sourceValue,
          instruction.word,
        );

        return {
          diff: [
            makeNextInstructionDiff(state, instruction.byteLength),
            makeSetNumberDiff(state, 'di', state.di + offset),
            makeSetNumberDiff(state, 'cx', cx),
            ...flagDiffs,
          ],
          variableClockCountEstimate: (state.cx - cx) * 15,
        };
      }
    }

    case 'movImmediateToRegister':
      return makeZeroVariableClockData([
        makeNextInstructionDiff(state, instruction.byteLength),
        makeSetRegisterValueDiff(state, instruction.op1, instruction.op2),
      ]);

    case 'retWithinSegAddingImmedToSp': {
      const stackAdress = getMemoryAddress(state, state.sp, 'ss');

      const newIp = state.memory.readWord(stackAdress);

      const newSp = state.sp + 2 + instruction.op1;

      return makeZeroVariableClockData([
        makeSetNumberDiff(state, 'ip', newIp),
        makeSetNumberDiff(state, 'sp', newSp),
      ]);
    }

    case 'retWithinSegment': {
      const stackAddress = getMemoryAddress(state, state.sp, 'ss');

      const newIp = state.memory.readWord(stackAddress);

      const newSp = state.sp + 2;

      return makeZeroVariableClockData([
        makeSetNumberDiff(state, 'ip', newIp),
        makeSetNumberDiff(state, 'sp', newSp),
      ]);
    }

    case 'lesLoadPointerToEs':
      return makeLoadPointerDiffs(state, instruction.op2, instruction.op1.name, 'es');

    case 'ldsLoadPointerToDs':
      return makeLoadPointerDiffs(state, instruction.op2, instruction.op1.name, 'ds');

    case 'movImmediateToRegisterMemory': {
      const dest = instruction.op1;

      return makeZeroVariableClockData([
        makeNextInstructionDiff(state, instruction.byteLength),
        ...makeSetRegisterOrMemoryValueDiffs(
          state,
          dest,
          instruction.op2,
          instruction.op1.kind === 'mem' && instruction.op1.length === 2,
          'ds',
        ),
      ]);
    }

    case 'retIntersegmentAddingImmediateToSp': {
      const stackAddress = getMemoryAddress(state, state.sp, 'ss');

      const newIp = state.memory.readWord(stackAddress);
      const newCs = state.memory.readWord(stackAddress + 2);

      const newSp = state.sp + 4 + instruction.op1;

      return makeZeroVariableClockData([
        makeSetNumberDiff(state, 'ip', newIp),
        makeSetNumberDiff(state, 'cs', newCs),
        makeSetNumberDiff(state, 'sp', newSp),
      ]);
    }

    case 'retIntersegment': {
      const stackAddress = getMemoryAddress(state, state.sp, 'ss');

      const newIp = state.memory.readWord(stackAddress);
      const newCs = state.memory.readWord(stackAddress + 2);

      const newSp = state.sp + 4;

      return makeZeroVariableClockData([
        makeSetNumberDiff(state, 'ip', newIp),
        makeSetNumberDiff(state, 'cs', newCs),
        makeSetNumberDiff(state, 'sp', newSp),
      ]);
    }

    case 'intType3':
      return makeInterruptDiff(state, 3);

    case 'intTypeSpecified':
      return makeInterruptDiff(state, instruction.op1);

    case 'loopneLoopWhileNotEqual': {
      const condition = state.cx - 1 !== 0 && !state.zeroFlag;

      return {
        diff: makeLoopDiff(state, instruction, condition),
        variableClockCountEstimate: condition ? 14 : 0, // 19 - 5
      };
    }

    case 'loopeLoopWhileEqual': {
      const condition = state.cx - 1 !== 0 && state.zeroFlag;

      return {
        diff: makeLoopDiff(state, instruction, condition),
        variableClockCountEstimate: condition ? 12 : 0, // 18 - 6
      };
    }

    case 'loopLoopCxTimes': {
      const condition = state.cx - 1 !== 0;

      return {
        diff: makeLoopDiff(state, instruction, condition),
        variableClockCountEstimate: condition ? 12 : 0, // 17 - 5
      };
    }

    case 'jcxzJumpOnCxZero':
      return state.cx === 0
        ? {
            diff: [
              makeSetNumberDiff(state, 'ip', state.ip + instruction.byteLength + instruction.op1),
            ],
            variableClockCountEstimate: 12, // 18 - 6
          }
        : makeZeroVariableClockData([makeNextInstructionDiff(state, instruction.byteLength)]);

    default:
      return makeZeroVariableClockData([]);
  }
}

function getRegisterOperand(instruction: {
  readonly op1: RegisterOrEac;
  readonly op2: RegisterOrEac;
}): Register {
  const regOperand = instruction.op1.kind === 'reg' ? instruction.op1 : instruction.op2;

  if (regOperand.kind !== 'reg') {
    throw Error('Internal Error - Two memory operands?');
  }

  return regOperand;
}

function getWordFromRegisterOrEac(registerOrEac: RegisterOrEac): boolean {
  return registerOrEac.kind === 'reg' ? isWordRegister(registerOrEac) : registerOrEac.length === 2;
}

function makeLoopDiff(
  state: ReadonlySimulationState,
  instruction: { op1: number; byteLength: number },
  condition: boolean,
): SimulationStateDiff {
  return [
    condition
      ? makeSetNumberDiff(state, 'ip', state.ip + instruction.byteLength + instruction.op1)
      : makeNextInstructionDiff(state, instruction.byteLength),
    makeSetNumberDiff(state, 'cx', state.cx - 1),
  ];
}

function makeShortLabelJumpDiff(
  state: ReadonlySimulationState,
  instruction: { op1: number; byteLength: number },
  condition: boolean,
): SimulatedInstructionData {
  return condition
    ? {
        diff: [makeSetNumberDiff(state, 'ip', state.ip + instruction.byteLength + instruction.op1)],
        variableClockCountEstimate: 12, // 16 (conditional clocks) - 4 (min clocks)
      }
    : makeZeroVariableClockData([makeNextInstructionDiff(state, instruction.byteLength)]);
}

function makeAddDiffs(
  state: ReadonlySimulationState,
  dest: RegisterOrEac,
  sourceValue: number,
  word: boolean,
  instructionLength: number,
  updateCarry = true,
): SimulatedInstructionData {
  const destValue = getRegisterOrEacValue(state, dest, word, 'ds');

  const auxCarry = (destValue & 0b1111) + (sourceValue & 0b1111) > 0b1111;

  let result = destValue + sourceValue;

  const max = word ? 65536 : 128;

  let carry: boolean | undefined = undefined;

  if (updateCarry) {
    carry = result >= max;
  }

  result = result % max;

  const overflow = getOverflowFlag(destValue, sourceValue, result, max);

  return makeZeroVariableClockData([
    makeNextInstructionDiff(state, instructionLength),
    ...makeSetRegisterOrMemoryValueDiffs(state, dest, result, word, 'ds'),
    ...makeFlagDiffsForArithmeticOp(state, result, overflow, word, auxCarry, carry),
  ]);
}

function makeOrDiffs(
  state: ReadonlySimulationState,
  dest: RegisterOrEac,
  sourceValue: number,
  word: boolean,
  instructionLength: number,
): SimulatedInstructionData {
  const destValue = getRegisterOrEacValue(state, dest, word, 'ds');

  const result = destValue | sourceValue;

  return makeZeroVariableClockData([
    makeNextInstructionDiff(state, instructionLength),
    ...makeSetRegisterOrMemoryValueDiffs(state, dest, result, word, 'ds'),
    ...makeFlagDiffsForLogicalOp(state, result, word),
  ]);
}

function makeAndDiffs(
  state: ReadonlySimulationState,
  dest: RegisterOrEac,
  sourceValue: number,
  word: boolean,
  instructionLength: number,
): SimulatedInstructionData {
  const { result, flagDiffs } = makeAndTestResults(state, dest, sourceValue, word);

  return makeZeroVariableClockData([
    makeNextInstructionDiff(state, instructionLength),
    ...makeSetRegisterOrMemoryValueDiffs(state, dest, result, word, 'ds'),
    ...flagDiffs,
  ]);
}

function makeTestDiffs(
  state: ReadonlySimulationState,
  dest: RegisterOrEac,
  sourceValue: number,
  word: boolean,
  instructionLength: number,
): SimulatedInstructionData {
  const { flagDiffs } = makeAndTestResults(state, dest, sourceValue, word);

  return makeZeroVariableClockData([
    makeNextInstructionDiff(state, instructionLength),
    ...flagDiffs,
  ]);
}

function makeAndTestResults(
  state: ReadonlySimulationState,
  dest: RegisterOrEac,
  sourceValue: number,
  word: boolean,
): {
  readonly result: number;
  readonly flagDiffs: Generator<SimulationStatePropertyDiff>;
} {
  const destValue = getRegisterOrEacValue(state, dest, word, 'ds');

  const result = destValue & sourceValue;

  return {
    result,
    flagDiffs: makeFlagDiffsForLogicalOp(state, result, word),
  };
}

function makeXorDiffs(
  state: ReadonlySimulationState,
  dest: RegisterOrEac,
  sourceValue: number,
  word: boolean,
  instructionLength: number,
): SimulatedInstructionData {
  const destValue = getRegisterOrEacValue(state, dest, word, 'ds');

  const result = destValue ^ sourceValue;

  return makeZeroVariableClockData([
    makeNextInstructionDiff(state, instructionLength),
    ...makeSetRegisterOrMemoryValueDiffs(state, dest, result, word, 'ds'),
    ...makeFlagDiffsForLogicalOp(state, result, word),
  ]);
}

function makeSubDiffs(
  state: ReadonlySimulationState,
  dest: RegisterOrEac,
  sourceValue: number,
  word: boolean,
  instructionLength: number,
  updateCarry = true,
): SimulatedInstructionData {
  const { result, flagDiffs } = makeSubOrCmpResults(state, dest, sourceValue, word, updateCarry);

  return makeZeroVariableClockData([
    makeNextInstructionDiff(state, instructionLength),
    ...makeSetRegisterOrMemoryValueDiffs(state, dest, result, word, 'ds'),
    ...flagDiffs,
  ]);
}

function makeCmpDiffs(
  state: ReadonlySimulationState,
  dest: RegisterOrEac,
  sourceValue: number,
  word: boolean,
  instructionLength: number,
): SimulatedInstructionData {
  const { flagDiffs } = makeSubOrCmpResults(state, dest, sourceValue, word);

  return makeZeroVariableClockData([
    makeNextInstructionDiff(state, instructionLength),
    ...flagDiffs,
  ]);
}

interface SubOrCmpResults {
  readonly result: number;
  readonly flagDiffs: Generator<SimulationStatePropertyDiff>;
}

function makeSubOrCmpResults(
  state: ReadonlySimulationState,
  dest: RegisterOrEac,
  sourceValue: number,
  word: boolean,
  updateCarry = true,
): SubOrCmpResults {
  const destValue = getRegisterOrEacValue(state, dest, word, 'ds');

  return makeSubOrCmpResultsWithDestValue(state, destValue, sourceValue, word, updateCarry);
}

function makeSubOrCmpResultsWithDestValue(
  state: ReadonlySimulationState,
  destValue: number,
  sourceValue: number,
  word: boolean,
  updateCarry = true,
): SubOrCmpResults {
  const auxCarry = (destValue & 0b1111) < (sourceValue & 0b1111);

  let result = destValue - sourceValue;

  const max = word ? 65536 : 128;

  let carry: boolean | undefined = undefined;

  if (updateCarry) {
    carry = result < 0;
  }

  result = result % max;

  if (result < 0) {
    result += max;
  }

  const overflow = getOverflowFlag(destValue, sourceValue, result, max);

  return {
    result,
    flagDiffs: makeFlagDiffsForArithmeticOp(state, result, overflow, word, auxCarry, carry),
  };
}

function makeXchgDiffs(
  state: ReadonlySimulationState,
  registerOperand: Register,
  otherOperand: RegisterOrEac,
  word: boolean,
  instructionLength: number,
): SimulatedInstructionData {
  const registerValue = getRegisterValue(state, registerOperand);

  const otherValue = getRegisterOrEacValue(state, otherOperand, word, 'ds');

  return makeZeroVariableClockData([
    makeNextInstructionDiff(state, instructionLength),
    makeSetRegisterValueDiff(state, registerOperand, otherValue),
    ...makeSetRegisterOrMemoryValueDiffs(state, otherOperand, registerValue, word, 'ds'),
  ]);
}

function makePushDiffs(
  state: ReadonlySimulationState,
  register: SegmentRegister | WordRegisterName,
  instructionLength: number,
): SimulatedInstructionData {
  const newSp = state.sp - 2;

  const stackAddress = getMemoryAddress(state, newSp, 'ss');

  return makeZeroVariableClockData([
    makeNextInstructionDiff(state, instructionLength),
    makeSetNumberDiff(state, 'sp', newSp),
    ...makeSetMemoryValueDiffs(state, stackAddress, state[register], true),
  ]);
}

function makePopDiffs(
  state: ReadonlySimulationState,
  dest: SegmentRegister | WordRegisterName | RegisterOrEac,
  instructionLength: number,
): SimulatedInstructionData {
  const stackAddress = getMemoryAddress(state, state.sp, 'ss');

  const value = state.memory.readWord(stackAddress);

  return makeZeroVariableClockData([
    makeNextInstructionDiff(state, instructionLength),
    makeSetNumberDiff(state, 'sp', state.sp + 2),
    ...(typeof dest === 'string'
      ? [makeSetNumberDiff(state, dest, value)]
      : makeSetRegisterOrMemoryValueDiffs(state, dest, value, true, 'ds')),
  ]);
}

function* makeRepMovsMemoryDiffs(
  state: ReadonlySimulationState,
  word: boolean,
): Generator<MemoryDiff> {
  const direction = state.directionFlag ? -1 : 1;
  const size = word ? 2 : 1;

  for (let i = 0; state.cx - i >= 0; i++) {
    const offset = i * direction * size;

    const { destAddress, sourceAddress } = getStringInstructionAddresses(state, offset);

    yield* makeSetMemoryValueDiffs(
      state,
      destAddress,
      word ? state.memory.readWord(sourceAddress) : state.memory.readByte(sourceAddress),
      word,
    );
  }
}

function makeLoadPointerDiffs(
  state: ReadonlySimulationState,
  eac: EffectiveAddressCalculation,
  register: WordRegisterName,
  segmentRegister: SegmentRegister,
): SimulatedInstructionData {
  const newRegisterValue = getMemoryValueFromEac(state, eac, true, 'ds');

  const newSegmentRegisterValue = getMemoryValueFromEac(
    state,
    { ...eac, displacement: (eac.displacement ?? 0) + 2 },
    true,
    'ds',
  );

  return makeZeroVariableClockData([
    makeSetNumberDiff(state, register, newRegisterValue),
    makeSetNumberDiff(state, segmentRegister, newSegmentRegisterValue),
  ]);
}

function getStringInstructionAddresses(
  state: ReadonlySimulationState,
  offset: number,
): {
  readonly destAddress: number;
  readonly sourceAddress: number;
} {
  return {
    destAddress: getMemoryAddress(state, state.di + offset, 'es'),
    sourceAddress: getMemoryAddress(state, state.si + offset, 'ds'),
  };
}

function* makeStringInstructionRegisterDiffs(
  state: ReadonlySimulationState,
  repetitions: number,
  word: boolean,
): Generator<SimulationStatePropertyDiff> {
  const direction = state.directionFlag ? -1 : 1;

  const size = word ? 2 : 1;

  const offset = repetitions * direction * size;

  yield makeSetNumberDiff(state, 'di', state.di + offset);
  yield makeSetNumberDiff(state, 'si', state.si + offset);
}

function makeInterruptDiff(
  state: ReadonlySimulationState,
  interruptType: number,
): SimulatedInstructionData {
  const flagsValue = getFlagsValue(state);

  const interruptPointerAddress = interruptType * 4;

  const newIp = state.memory.readWord(interruptPointerAddress);
  const newCs = state.memory.readWord(interruptPointerAddress + 2);

  const newSp = state.sp - 6;
  const newStackAddress = getMemoryAddress(state, newSp, 'ss');

  return makeZeroVariableClockData([
    makeSetNumberDiff(state, 'ip', newIp),
    makeSetNumberDiff(state, 'cs', newCs),
    makeSetNumberDiff(state, 'sp', newSp),
    ...makeSetMemoryValueDiffs(state, newStackAddress, state.ip, true),
    ...makeSetMemoryValueDiffs(state, newStackAddress + 2, state.cs, true),
    ...makeSetMemoryValueDiffs(state, newStackAddress + 4, flagsValue, true),
    makeSetFlagDiff(state, 'trapFlag', false),
    makeSetFlagDiff(state, 'interruptFlag', false),
  ]);
}

// https://en.wikipedia.org/wiki/Overflow_flag
function getOverflowFlag(
  destValue: number,
  sourceValue: number,
  result: number,
  max: 128 | 65536,
): boolean {
  const destSignBit = destValue >= max / 2;
  const sourceSignBit = sourceValue >= max / 2;
  const resultSignBit = result >= max / 2;

  return resultSignBit !== destSignBit && sourceSignBit !== destSignBit;
}

function getRegisterOrEacValue(
  state: ReadonlySimulationState,
  registerOrEac: RegisterOrEac,
  word: boolean,
  defaultSegment: SegmentRegister,
): number {
  if (registerOrEac.kind === 'reg') {
    return getRegisterValue(state, registerOrEac);
  } else {
    return getMemoryValueFromEac(state, registerOrEac, word, defaultSegment);
  }
}

function getRegisterValue(state: ReadonlySimulationState, register: Register): number {
  if (isWordRegister(register)) {
    return state[register.name];
  } else {
    const mainRegister = mainRegisterTable[register.name];

    if (isHigh8BitRegister(register)) {
      return (state[mainRegister] & 0xff00) >> 8;
    } else {
      return state[mainRegister] & 0x00ff;
    }
  }
}

function getMemoryValueFromEac(
  state: ReadonlySimulationState,
  eac: EffectiveAddressCalculation,
  word: boolean,
  defaultSegment: SegmentRegister,
): number {
  const address = getMemoryAddressFromEac(state, eac, defaultSegment);

  return word ? state.memory.readWord(address) : state.memory.readByte(address);
}

function getRegisterOffsetPartFromEac(
  state: ReadonlySimulationState,
  eac: EffectiveAddressCalculation,
): number {
  switch (eac.calculationKind) {
    case 'bx + si':
      return state.bx + state.si;
    case 'bx + di':
      return state.bx + state.di;
    case 'bp + si':
      return state.bp + state.si;
    case 'bp + di':
      return state.bp + state.di;
    case 'si':
      return state.si;
    case 'di':
      return state.di;
    case 'bp':
      return state.bp;
    case 'bx':
      return state.bx;
    case 'DIRECT ADDRESS':
      return 0;
  }
}

function getOffsetFromEac(
  state: ReadonlySimulationState,
  eac: EffectiveAddressCalculation,
): number {
  const reigsterPart = getRegisterOffsetPartFromEac(state, eac);

  return reigsterPart + (eac.displacement ?? 0);
}

function getMemoryAddressFromEac(
  state: ReadonlySimulationState,
  eac: EffectiveAddressCalculation,
  defaultSegment: SegmentRegister,
): number {
  const offsetInSegment = getOffsetFromEac(state, eac);

  const segmentRegister = eac.segmentOverridePrefix ?? defaultSegment;

  return getMemoryAddress(state, offsetInSegment, segmentRegister);
}

function getMemoryAddress(
  state: ReadonlySimulationState,
  offsetInSegment: number,
  segmentRegister: SegmentRegister,
): number {
  const segmentValue = state[segmentRegister];

  return ((segmentValue << 4) + offsetInSegment) % total8086MemorySizeInBytes;
}

function* makeSetRegisterOrMemoryValueDiffs(
  state: ReadonlySimulationState,
  dest: RegisterOrEac,
  value: number,
  wordIfMemoryDest: boolean,
  defaultSegment: SegmentRegister,
): Generator<SimulationStatePropertyDiff> {
  if (dest.kind === 'reg') {
    yield makeSetRegisterValueDiff(state, dest, value);
  } else {
    yield* makeSetMemoryValueDiffsFromEac(state, dest, value, wordIfMemoryDest, defaultSegment);
  }
}

function makeSetRegisterValueDiff(
  state: ReadonlySimulationState,
  register: Register,
  value: number,
): SimulationStatePropertyDiff {
  let mainRegister: WordRegisterName;
  let newValue: number;

  if (isWordRegister(register)) {
    mainRegister = register.name;
    newValue = value;
  } else {
    mainRegister = mainRegisterTable[register.name];

    if (isHigh8BitRegister(register)) {
      newValue = (state[mainRegister] & 0x00ff) + (value << 8);
    } else {
      newValue = (state[mainRegister] & 0xff00) + value;
    }
  }

  return makeSetNumberDiff(state, mainRegister, newValue);
}

function makeNextInstructionDiff(
  state: ReadonlySimulationState,
  currentInstructionLength: number,
): SimulationStatePropertyDiff {
  return makeSetNumberDiff(state, 'ip', state.ip + currentInstructionLength);
}

function* makeSetMemoryValueDiffsFromEac(
  state: ReadonlySimulationState,
  eac: EffectiveAddressCalculation,
  value: number,
  word: boolean,
  defaultSegment: SegmentRegister,
): Generator<SimulationStatePropertyDiff> {
  const address = getMemoryAddressFromEac(state, eac, defaultSegment);

  yield* makeSetMemoryValueDiffs(state, address, value, word);
}

function* makeSetMemoryValueDiffs(
  state: ReadonlySimulationState,
  address: number,
  value: number,
  word: boolean,
): Generator<MemoryDiff> {
  if (word) {
    const leastSignificantByte = value & 0x00ff;
    const mostSignificantByte = (value & 0xff00) >> 8;

    yield makeSetMemoryValueDiff(state, address + 1, mostSignificantByte);
    yield makeSetMemoryValueDiff(state, address, leastSignificantByte);
  } else {
    yield makeSetMemoryValueDiff(state, address, value);
  }
}

function* makeFlagDiffsForLogicalOp(
  state: ReadonlySimulationState,
  result: number,
  word: boolean,
): Generator<SimulationStatePropertyDiff> {
  yield makeSetFlagDiff(state, 'overflowFlag', false);
  yield makeSetSignFlagDiff(state, result, word);
  yield makeSetZeroFlagDiff(state, result);
  yield makeSetParityFlagDiff(state, result);
  yield makeSetFlagDiff(state, 'carryFlag', false);
}

function* makeFlagDiffsForArithmeticOp(
  state: ReadonlySimulationState,
  result: number,
  overflow: boolean,
  word: boolean,
  auxCarry: boolean,
  carry: boolean | undefined,
): Generator<SimulationStatePropertyDiff> {
  yield makeSetFlagDiff(state, 'overflowFlag', overflow);
  yield makeSetSignFlagDiff(state, result, word);
  yield makeSetZeroFlagDiff(state, result);
  yield makeSetFlagDiff(state, 'auxCarryFlag', auxCarry);
  yield makeSetParityFlagDiff(state, result);
  if (carry !== undefined) {
    yield makeSetFlagDiff(state, 'carryFlag', carry);
  }
}

function getFlagsValue(state: ReadonlySimulationState): number {
  const overflow = state.overflowFlag ? OVERFLOW_FLAG : 0;
  const direction = state.directionFlag ? DIRECTION_FLAG : 0;
  const interrupt = state.interruptFlag ? INTERRUPT_FLAG : 0;
  const trap = state.trapFlag ? TRAP_FLAG : 0;
  const sign = state.signFlag ? SIGN_FLAG : 0;
  const zero = state.zeroFlag ? ZERO_FLAG : 0;
  const auxCarry = state.auxCarryFlag ? AUX_CARRY_FLAG : 0;
  const parity = state.parityFlag ? PARITY_FLAG : 0;
  const carry = state.carryFlag ? CARRY_FLAG : 0;

  return overflow & direction & interrupt & trap & sign & zero & auxCarry & parity & carry;
}

function makeSetZeroFlagDiff(
  state: ReadonlySimulationState,
  result: number,
): SimulationStatePropertyDiff {
  return makeSetFlagDiff(state, 'zeroFlag', result === 0);
}

function makeSetSignFlagDiff(
  state: ReadonlySimulationState,
  result: number,
  word: boolean,
): SimulationStatePropertyDiff {
  const max = word ? 65536 : 128;
  const value = (result & (max / 2)) !== 0;

  return makeSetFlagDiff(state, 'signFlag', value);
}

// https://medium.com/free-code-camp/algorithmic-problem-solving-efficiently-computing-the-parity-of-a-stream-of-numbers-cd652af14643
function makeSetParityFlagDiff(
  state: ReadonlySimulationState,
  result: number,
): SimulationStatePropertyDiff {
  let parityCheckResult = result & 0xff;
  parityCheckResult ^= parityCheckResult >> 4;
  parityCheckResult ^= parityCheckResult >> 2;
  parityCheckResult ^= parityCheckResult >> 1;

  return {
    key: 'parityFlag',
    from: state.parityFlag,
    to: !(parityCheckResult & 1),
  };
}

function makeSetFlagDiff(
  state: ReadonlySimulationState,
  flag: KeyOfType<ReadonlySimulationState, boolean>,
  value: boolean,
): GenericSimulationStatePropertyDiff<boolean> {
  return {
    key: flag,
    from: state[flag],
    to: value,
  };
}

function makeSetNumberDiff(
  state: ReadonlySimulationState,
  key: KeyOfType<ReadonlySimulationState, number>,
  value: number,
): GenericSimulationStatePropertyDiff<number> {
  return {
    key,
    from: state[key],
    to: value,
  };
}

function makeSetMemoryValueDiff(
  state: ReadonlySimulationState,
  address: number,
  value: number,
): MemoryDiff {
  return {
    address,
    from: state.memory.readByte(address),
    to: value,
  };
}

function applyDiff(state: SimulationState, diff: SimulationStateDiff): void {
  for (const propertyDiff of diff) {
    if ('key' in propertyDiff) {
      // @ts-expect-error the type of SimulationStatePropertyDiff guarantees that we've got the correct
      // relationship between the key and the type of to (or from), but TS doesn't understand that relationship
      state[propertyDiff.key] = propertyDiff.to;
    } else {
      state.memory.writeByte(propertyDiff.address, propertyDiff.to);
    }
  }
}

function makeZeroVariableClockData(diff: SimulationStateDiff): SimulatedInstructionData {
  return {
    diff,
    variableClockCountEstimate: 0,
  };
}

/**
 * Handle any 8-bit sign extended negative values so that the carry flag works correctly!
 */
function sanitize8BitSignExtendedNegatives(value: number): number {
  if (value < 0) {
    return 65536 + value;
  } else {
    return value;
  }
}
