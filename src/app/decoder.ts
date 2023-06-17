import {
  EffectiveAddressCalculationCategory,
  effectiveAddressDecodingTable,
} from './effective-address-data';
import {
  AccumulatorRegister,
  Register,
  SegmentRegister,
  WordRegister,
  alReg,
  axReg,
  clReg,
  dxReg,
  isWordRegister,
  registerDecodingTable,
  segmentRegisterDecodingTable,
  wordRegisterDecodingTable,
} from './register-data';

export type Operand = Register | SegmentRegister | EffectiveAddressCalculation | number;

interface _NoOperandInstruction<TKind extends string> {
  readonly kind: TKind;
}

type _OneOperandInstruction<
  TKind extends string,
  TOp1 extends Operand,
> = _NoOperandInstruction<TKind> & {
  readonly op1: TOp1;
};

type _TwoOperandInstruction<
  TKind extends string,
  TOp1 extends Operand,
  TOp2 extends Operand,
> = _OneOperandInstruction<TKind, TOp1> & {
  readonly op2: TOp2;
};

interface _Lockable {
  readonly lock: boolean;
}

interface _Repable {
  readonly rep: RepPrefix | null;
}

interface _TracksWord {
  readonly word: boolean;
}

export type AddRegisterMemoryWithRegisterToEitherInstruction = _TwoOperandInstruction<
  'addRegisterMemoryWithRegisterToEither',
  RegisterOrEac,
  RegisterOrEac
> &
  _Lockable;

export type AddImmediateToAccumulatorInstruction = _TwoOperandInstruction<
  'addImmediateToAccumulator',
  AccumulatorRegister,
  number
>;

export type PushSegmentRegisterInstruction = _OneOperandInstruction<
  'pushSegmentRegister',
  SegmentRegister
>;

export type PopSegmentRegisterInstructions = _OneOperandInstruction<
  'popSegmentRegister',
  Exclude<SegmentRegister, 'cs'>
>;

export type OrRegisterMemoryAndRegisterToEitherInstruction = _TwoOperandInstruction<
  'orRegisterMemoryAndRegisterToEither',
  RegisterOrEac,
  RegisterOrEac
> &
  _Lockable;

export type OrImmediateToAccumulatorInstruction = _TwoOperandInstruction<
  'orImmediateToAccumulator',
  AccumulatorRegister,
  number
>;

export type AdcRegisterMemoryWithRegisterToEitherInstruction = _TwoOperandInstruction<
  'adcRegisterMemoryWithRegisterToEither',
  RegisterOrEac,
  RegisterOrEac
> &
  _Lockable;

export type AdcImmediateToAccumulatorInstruction = _TwoOperandInstruction<
  'adcImmediateToAccumulator',
  AccumulatorRegister,
  number
>;

export type SbbRegisterMemoryAndRegisterToEitherInstruction = _TwoOperandInstruction<
  'sbbRegisterMemoryAndRegisterToEither',
  RegisterOrEac,
  RegisterOrEac
> &
  _Lockable;

export type SbbImmediateFromAccumulatorInstruction = _TwoOperandInstruction<
  'sbbImmediateFromAccumulator',
  AccumulatorRegister,
  number
>;

export type AndRegisterMemoryWithRegisterToEitherInstruction = _TwoOperandInstruction<
  'andRegisterMemoryWithRegisterToEither',
  RegisterOrEac,
  RegisterOrEac
> &
  _Lockable;

export type AndImmediateToAccumulatorInstruction = _TwoOperandInstruction<
  'andImmediateToAccumulator',
  AccumulatorRegister,
  number
>;

export type DaaDecimalAdjustForAddInstruction = _NoOperandInstruction<'daaDecimalAdjustForAdd'>;

export type SubRegisterMemoryAndRegisterToEitherInstruction = _TwoOperandInstruction<
  'subRegisterMemoryAndRegisterToEither',
  RegisterOrEac,
  RegisterOrEac
> &
  _Lockable;

export type SubImmediateFromAccumulatorInstruction = _TwoOperandInstruction<
  'subImmediateFromAccumulator',
  AccumulatorRegister,
  number
>;

export type DasDecimalAdjustForSubtractInstruction =
  _NoOperandInstruction<'dasDecimalAdjustForSubtract'>;

export type XorRegisterMemoryAndRegisterToEitherInstruction = _TwoOperandInstruction<
  'xorRegisterMemoryAndRegisterToEither',
  RegisterOrEac,
  RegisterOrEac
> &
  _Lockable;

export type XorImmediateToAccumulatorInstruction = _TwoOperandInstruction<
  'xorImmediateToAccumulator',
  AccumulatorRegister,
  number
>;

export type AaaAsciiAdjustForAddInstruction = _NoOperandInstruction<'aaaAsciiAdjustForAdd'>;

export type CmpRegisterMemoryAndRegisterInstruction = _TwoOperandInstruction<
  'cmpRegisterMemoryAndRegister',
  RegisterOrEac,
  RegisterOrEac
>;

export type CmpImmediateWithAccumulatorInstruction = _TwoOperandInstruction<
  'cmpImmediateWithAccumulator',
  AccumulatorRegister,
  number
>;

export type AasAsciiAdjustForSubtractInstruction =
  _NoOperandInstruction<'aasAsciiAdjustForSubtract'>;

export type IncRegisterInstruction = _OneOperandInstruction<'incRegister', WordRegister>;

export type DecRegisterInstruction = _OneOperandInstruction<'decRegister', WordRegister>;

export type PushRegisterInstruction = _OneOperandInstruction<'pushRegister', WordRegister>;

export type PopRegisterInstruction = _OneOperandInstruction<'popRegister', WordRegister>;

export type JoJumpOnOverflowInstruction = _OneOperandInstruction<'joJumpOnOverflow', number>;

export type JnoJumpOnNotOverflowInstruction = _OneOperandInstruction<
  'jnoJumpOnNotOverflow',
  number
>;

export type JbJumpOnBelowInstruction = _OneOperandInstruction<'jbJumpOnBelow', number>;

export type JnbJumpOnNotBelowInstruction = _OneOperandInstruction<'jnbJumpOnNotBelow', number>;

export type JeJumpOnEqualInstruction = _OneOperandInstruction<'jeJumpOnEqual', number>;

export type JneJumpOnNotEqualInstruction = _OneOperandInstruction<'jneJumpOnNotEqual', number>;

export type JnaJumpOnNotAboveInstruction = _OneOperandInstruction<'jnaJumpOnNotAbove', number>;

export type JaJumpOnAboveInstruction = _OneOperandInstruction<'jaJumpOnAbove', number>;

export type JsJumpOnSignInstruction = _OneOperandInstruction<'jsJumpOnSign', number>;

export type JnsJumpOnNotSignInstruction = _OneOperandInstruction<'jnsJumpOnNotSign', number>;

export type JpJumpOnParityInstruction = _OneOperandInstruction<'jpJumpOnParity', number>;

export type JnpJumpOnNotParityInstruction = _OneOperandInstruction<'jnpJumpOnNotParity', number>;

export type JlJumpOnLessInstruction = _OneOperandInstruction<'jlJumpOnLess', number>;

export type JnlJumpOnNotLessInstruction = _OneOperandInstruction<'jnlJumpOnNotLess', number>;

export type JngJumpOnNotGreaterInstruction = _OneOperandInstruction<'jngJumpOnNotGreater', number>;

export type JgJumpOnGreaterInstruction = _OneOperandInstruction<'jgJumpOnGreater', number>;

export type AddImmediateToRegisterMemoryInstruction = _TwoOperandInstruction<
  'addImmediateToRegisterMemory',
  RegisterOrEac,
  number
> &
  _Lockable;

export type OrImmediateToRegisterMemoryInstruction = _TwoOperandInstruction<
  'orImmediateToRegisterMemory',
  RegisterOrEac,
  number
> &
  _Lockable;

export type AdcImmediateToRegisterMemoryInstruction = _TwoOperandInstruction<
  'adcImmediateToRegisterMemory',
  RegisterOrEac,
  number
> &
  _Lockable;

export type SbbImmediateToRegisterMemoryInstruction = _TwoOperandInstruction<
  'sbbImmediateToRegisterMemory',
  RegisterOrEac,
  number
> &
  _Lockable;

export type AndImmediateToRegisterMemoryInstruction = _TwoOperandInstruction<
  'andImmediateToRegisterMemory',
  RegisterOrEac,
  number
> &
  _Lockable;

export type SubImmediateToRegisterMemoryInstruction = _TwoOperandInstruction<
  'subImmediateToRegisterMemory',
  RegisterOrEac,
  number
> &
  _Lockable;

export type XorImmediateToRegisterMemoryInstruction = _TwoOperandInstruction<
  'xorImmediateToRegisterMemory',
  RegisterOrEac,
  number
> &
  _Lockable;

export type CmpImmediateToRegisterMemoryInstruction = _TwoOperandInstruction<
  'cmpImmediateToRegisterMemory',
  RegisterOrEac,
  number
>;

export type TestRegisterMemoryAndRegisterInstruction = _TwoOperandInstruction<
  'testRegisterMemoryAndRegister',
  RegisterOrEac,
  Register
>;

export type XchgRegisterMemoryWithRegisterInstruction = _TwoOperandInstruction<
  'xchgRegisterMemoryWithRegister',
  RegisterOrEac,
  RegisterOrEac
> &
  _Lockable;

export type MovRegisterMemoryToFromRegisterInstruction = _TwoOperandInstruction<
  'movRegisterMemoryToFromRegister',
  RegisterOrEac,
  RegisterOrEac
>;

export type MovSegmentRegisterToRegisterMemoryInstruction = _TwoOperandInstruction<
  'movSegmentRegisterToRegisterMemory',
  RegisterOrEac,
  SegmentRegister
>;

export type LeaLoadEaToRegisterInstruction = _TwoOperandInstruction<
  'leaLoadEaToRegister',
  WordRegister,
  EffectiveAddressCalculation
>;

export type MovRegisterMemoryToSegmentRegisterInstruction = _TwoOperandInstruction<
  'movRegisterMemoryToSegmentRegister',
  SegmentRegister,
  RegisterOrEac
>;

export type PopRegisterMemoryInstruction = _OneOperandInstruction<
  'popRegisterMemory',
  RegisterOrEac
>;

export type XchgRegisterWithAccumulatorInstruction = _TwoOperandInstruction<
  'xchgRegisterWithAccumulator',
  typeof axReg,
  WordRegister
>;

export type CbwConvertByteToWordInstruction = _NoOperandInstruction<'cbwConvertByteToWord'>;

export type CwdConvertWordToDoubleWordInstruction =
  _NoOperandInstruction<'cwdConvertWordToDoubleWord'>;

export type CallDirectIntersegmentInstruction = _TwoOperandInstruction<
  'callDirectIntersegment',
  number,
  number
>;

export type WaitInstruction = _NoOperandInstruction<'wait'>;

export type PushfPushFlagsInstruction = _NoOperandInstruction<'pushfPushFlags'>;

export type PopfPopFlagsInstruction = _NoOperandInstruction<'popfPopFlags'>;

export type SahfStoreAhIntoFlagsInstruction = _NoOperandInstruction<'sahfStoreAhIntoFlags'>;

export type LahfLoadAhWithFlagsInstruction = _NoOperandInstruction<'lahfLoadAhWithFlags'>;

export type MovMemoryToAccumulatorInstruction = _TwoOperandInstruction<
  'movMemoryToAccumulator',
  AccumulatorRegister,
  { kind: 'mem'; calculationKind: 'DIRECT ADDRESS'; displacement: number; length: null }
>;

export type MovAccumulatorToMemoryInstruction = _TwoOperandInstruction<
  'movAccumulatorToMemory',
  { kind: 'mem'; calculationKind: 'DIRECT ADDRESS'; displacement: number; length: null },
  AccumulatorRegister
>;

export type MovsMoveByteWordInstruction = _NoOperandInstruction<'movsMoveByteWord'> &
  _Repable &
  _TracksWord;

export type CmpsCompareByteWordInstruction = _NoOperandInstruction<'cmpsCompareByteWord'> &
  _Repable &
  _TracksWord;

export type TestImmediateWithAccumulatorInstruction = _TwoOperandInstruction<
  'testImmediateWithAccumulator',
  AccumulatorRegister,
  number
>;

export type StosStoreByteWordFromAlAxInstruction =
  _NoOperandInstruction<'stosStoreByteWordFromAlAx'> & _Repable & _TracksWord;

export type LodsLoadByteWordFromAlAxInstruction =
  _NoOperandInstruction<'lodsLoadByteWordFromAlAx'> & _Repable & _TracksWord;

export type ScasScanByteWordInstruction = _NoOperandInstruction<'scasScanByteWord'> &
  _Repable &
  _TracksWord;

export type MovImmediateToRegisterInstruction = _TwoOperandInstruction<
  'movImmediateToRegister',
  Register,
  number
>;

export type RetWithinSegAddingImmedToSpInstruction = _OneOperandInstruction<
  'retWithinSegAddingImmedToSp',
  number
>;

export type RetWithinSegmentInstruction = _NoOperandInstruction<'retWithinSegment'>;

export type LesLoadPointerToEsInstruction = _TwoOperandInstruction<
  'lesLoadPointerToEs',
  WordRegister,
  EffectiveAddressCalculation
>;

export type LdsLoadPointerToDsInstruction = _TwoOperandInstruction<
  'ldsLoadPointerToDs',
  WordRegister,
  EffectiveAddressCalculation
>;

export type MovImmediateToRegisterMemoryInstruction = _TwoOperandInstruction<
  'movImmediateToRegisterMemory',
  RegisterOrEac,
  number
>;

export type RetIntersegmentAddingImmediateToSpInstruction = _OneOperandInstruction<
  'retIntersegmentAddingImmediateToSp',
  number
>;

export type RetIntersegmentInstruction = _NoOperandInstruction<'retIntersegment'>;

export type IntType3Instruction = _NoOperandInstruction<'intType3'>;

export type IntTypeSpecifiedInstruction = _OneOperandInstruction<'intTypeSpecified', number>;

export type IntoInterruptOnOverflowInstruction = _NoOperandInstruction<'intoInterruptOnOverflow'>;

export type IretInterruptReturnInstruction = _NoOperandInstruction<'iretInterruptReturn'>;

export type RolRotateLeftInstruction = _TwoOperandInstruction<
  'rolRotateLeft',
  RegisterOrEac,
  1 | typeof clReg
>;

export type RorRotateRightInstruction = _TwoOperandInstruction<
  'rorRotateRight',
  RegisterOrEac,
  1 | typeof clReg
>;

export type RclRotateThroughCarryFlagLeftInstruction = _TwoOperandInstruction<
  'rclRotateThroughCarryFlagLeft',
  RegisterOrEac,
  1 | typeof clReg
>;

export type RcrRotateThroughCarryRightInstruction = _TwoOperandInstruction<
  'rcrRotateThroughCarryRight',
  RegisterOrEac,
  1 | typeof clReg
>;

export type SalShiftLogicalArithmeticLeftInstruction = _TwoOperandInstruction<
  'salShiftLogicalArithmeticLeft',
  RegisterOrEac,
  1 | typeof clReg
>;

export type ShrShiftLogicalRightInstruction = _TwoOperandInstruction<
  'shrShiftLogicalRight',
  RegisterOrEac,
  1 | typeof clReg
>;

export type SarShiftArithmeticRightInstruction = _TwoOperandInstruction<
  'sarShiftArithmeticRight',
  RegisterOrEac,
  1 | typeof clReg
>;

export type AamAsciiAdjustForMultipleInstruction =
  _NoOperandInstruction<'aamAsciiAdjustForMultiply'>;

export type AadAsciiAdjustForDivideInstruction = _NoOperandInstruction<'aadAsciiAdjustForDivide'>;

export type XlatTranslateByteToAlInstruction = _NoOperandInstruction<'xlatTranslateByteToAl'>;

export type EscEscapeToExternalDeviceInstruction = _TwoOperandInstruction<
  'escEscapeToExternalDevice',
  number,
  RegisterOrEac
>;

export type LoopneLoopWhileNotEqualInstruction = _OneOperandInstruction<
  'loopneLoopWhileNotEqual',
  number
>;

export type LoopeLoopWhileEqualInstruction = _OneOperandInstruction<'loopeLoopWhileEqual', number>;

export type LoopLoopCxTimesInstruction = _OneOperandInstruction<'loopLoopCxTimes', number>;

export type JcxzJumpOnCxZeroInstruction = _OneOperandInstruction<'jcxzJumpOnCxZero', number>;

export type InFixedPortInstruction = _TwoOperandInstruction<
  'inFixedPort',
  AccumulatorRegister,
  number
>;

export type OutFixedPortInstruction = _TwoOperandInstruction<
  'outFixedPort',
  number,
  AccumulatorRegister
>;

export type CallDirectWithinSegmentInstruction = _OneOperandInstruction<
  'callDirectWithinSegment',
  number
>;

export type JmpDirectWithinSegmentInstruction = _OneOperandInstruction<
  'jmpDirectWithinSegment',
  number
>;

export type JmpDirectIntersegmentInstruction = _TwoOperandInstruction<
  'jmpDirectIntersegment',
  number,
  number
>;

export type JmpDirectWithinSegmentShortInstruction = _OneOperandInstruction<
  'jmpDirectWithinSegmentShort',
  number
>;

export type InVariablePortInstruction = _TwoOperandInstruction<
  'inVariablePort',
  AccumulatorRegister,
  typeof dxReg
>;

export type OutVariablePortInstruction = _TwoOperandInstruction<
  'outVariablePort',
  typeof dxReg,
  AccumulatorRegister
>;

export type HltHaltInstruction = _NoOperandInstruction<'hltHalt'>;

export type CmcComplementCarryInstruction = _NoOperandInstruction<'cmcComplementCarry'>;

export type TestImmediateDataAndRegisterMemoryInstruction = _TwoOperandInstruction<
  'testImmediateDataAndRegisterMemory',
  RegisterOrEac,
  number
>;

export type NotInvertInstruction = _OneOperandInstruction<'notInvert', RegisterOrEac> & _Lockable;

export type NegChangeSignInstruction = _OneOperandInstruction<'negChangeSign', RegisterOrEac> &
  _Lockable;

export type MulMultiplyUnsignedInstruction = _OneOperandInstruction<
  'mulMultiplyUnsigned',
  RegisterOrEac
>;

export type ImulIntegerMultiplySignedInstruction = _OneOperandInstruction<
  'imulIntegerMultiplySigned',
  RegisterOrEac
>;

export type DivDivideUnsignedInstruction = _OneOperandInstruction<
  'divDivideUnsigned',
  RegisterOrEac
>;

export type IdivIntegerDivideSignedInstruction = _OneOperandInstruction<
  'idivIntegerDivideSigned',
  RegisterOrEac
>;

export type ClcClearCarryInstruction = _NoOperandInstruction<'clcClearCarry'>;

export type StcSetCarryInstruction = _NoOperandInstruction<'stcSetCarry'>;

export type CliClearInterruptInstruction = _NoOperandInstruction<'cliClearInterrupt'>;

export type StiSetInterruptInstruction = _NoOperandInstruction<'stiSetInterrupt'>;

export type CldClearDirectionInstruction = _NoOperandInstruction<'cldClearDirection'>;

export type StdSetDirectionInstruction = _NoOperandInstruction<'stdSetDirection'>;

export type IncRegisterMemoryInstruction = _OneOperandInstruction<
  'incRegisterMemory',
  RegisterOrEac
> &
  _Lockable;

export type DecRegisterMemoryInstruction = _OneOperandInstruction<
  'decRegisterMemory',
  RegisterOrEac
> &
  _Lockable;

export type CallIndirectWithinSegmentInstruction = _OneOperandInstruction<
  'callIndirectWithinSegment',
  RegisterOrEac
>;

export type CallIndirectIntersegmentInstruction = _OneOperandInstruction<
  'callIndirectIntersegment',
  EffectiveAddressCalculation
>;

export type JmpIndirectWithinSegmentInstruction = _OneOperandInstruction<
  'jmpIndirectWithinSegment',
  RegisterOrEac
>;

export type JmpIndirectIntersegmentInstruction = _OneOperandInstruction<
  'jmpIndirectIntersegment',
  EffectiveAddressCalculation
>;

// Table 4-35 says MEM16 only, but 4-12 calls it Push register/memory,
// and the equivalent pop instruction is register/memory, so...
export type PushRegisterMemoryInstruction = _OneOperandInstruction<
  'pushRegisterMemory',
  RegisterOrEac
>;

export type UnknownInstruction = _NoOperandInstruction<'UNKNOWN'>;

export type NotUsedInstruction = _OneOperandInstruction<'NOT USED', number>;

type ShortLabelJumpInstruction =
  | JoJumpOnOverflowInstruction
  | JnoJumpOnNotOverflowInstruction
  | JbJumpOnBelowInstruction
  | JnbJumpOnNotBelowInstruction
  | JeJumpOnEqualInstruction
  | JneJumpOnNotEqualInstruction
  | JnaJumpOnNotAboveInstruction
  | JaJumpOnAboveInstruction
  | JsJumpOnSignInstruction
  | JnsJumpOnNotSignInstruction
  | JpJumpOnParityInstruction
  | JnpJumpOnNotParityInstruction
  | JlJumpOnLessInstruction
  | JnlJumpOnNotLessInstruction
  | JngJumpOnNotGreaterInstruction
  | JgJumpOnGreaterInstruction;

type ArithmeticLogicImmediateToRegisterMemoryInstruction =
  | AddImmediateToRegisterMemoryInstruction
  | OrImmediateToRegisterMemoryInstruction
  | AdcImmediateToRegisterMemoryInstruction
  | SbbImmediateToRegisterMemoryInstruction
  | AndImmediateToRegisterMemoryInstruction
  | SubImmediateToRegisterMemoryInstruction
  | XorImmediateToRegisterMemoryInstruction
  | CmpImmediateToRegisterMemoryInstruction;

type LogicWithOneOrClInstruction =
  | RolRotateLeftInstruction
  | RorRotateRightInstruction
  | RclRotateThroughCarryFlagLeftInstruction
  | RcrRotateThroughCarryRightInstruction
  | SalShiftLogicalArithmeticLeftInstruction
  | ShrShiftLogicalRightInstruction
  | SarShiftArithmeticRightInstruction;

type LoopOrJumpCxInstuction =
  | LoopneLoopWhileNotEqualInstruction
  | LoopeLoopWhileEqualInstruction
  | LoopLoopCxTimesInstruction
  | JcxzJumpOnCxZeroInstruction;

type SingleOperandMathInstruction =
  | NotInvertInstruction
  | NegChangeSignInstruction
  | MulMultiplyUnsignedInstruction
  | ImulIntegerMultiplySignedInstruction
  | DivDivideUnsignedInstruction
  | IdivIntegerDivideSignedInstruction;

type MiscFfByteInstruction =
  | IncRegisterMemoryInstruction
  | DecRegisterMemoryInstruction
  | CallIndirectWithinSegmentInstruction
  | CallIndirectIntersegmentInstruction
  | JmpIndirectWithinSegmentInstruction
  | JmpIndirectIntersegmentInstruction
  | PushRegisterMemoryInstruction;

type DecodedInstructionInternal =
  | AddRegisterMemoryWithRegisterToEitherInstruction
  | AddImmediateToAccumulatorInstruction
  | PushSegmentRegisterInstruction
  | PopSegmentRegisterInstructions
  | OrRegisterMemoryAndRegisterToEitherInstruction
  | OrImmediateToAccumulatorInstruction
  | AdcRegisterMemoryWithRegisterToEitherInstruction
  | AdcImmediateToAccumulatorInstruction
  | SbbRegisterMemoryAndRegisterToEitherInstruction
  | SbbImmediateFromAccumulatorInstruction
  | AndRegisterMemoryWithRegisterToEitherInstruction
  | AndImmediateToAccumulatorInstruction
  | DaaDecimalAdjustForAddInstruction
  | SubRegisterMemoryAndRegisterToEitherInstruction
  | SubImmediateFromAccumulatorInstruction
  | DasDecimalAdjustForSubtractInstruction
  | XorRegisterMemoryAndRegisterToEitherInstruction
  | XorImmediateToAccumulatorInstruction
  | AaaAsciiAdjustForAddInstruction
  | CmpRegisterMemoryAndRegisterInstruction
  | CmpImmediateWithAccumulatorInstruction
  | AasAsciiAdjustForSubtractInstruction
  | IncRegisterInstruction
  | DecRegisterInstruction
  | PushRegisterInstruction
  | PopRegisterInstruction
  | ShortLabelJumpInstruction
  | ArithmeticLogicImmediateToRegisterMemoryInstruction
  | TestRegisterMemoryAndRegisterInstruction
  | XchgRegisterMemoryWithRegisterInstruction
  | MovRegisterMemoryToFromRegisterInstruction
  | MovSegmentRegisterToRegisterMemoryInstruction
  | LeaLoadEaToRegisterInstruction
  | MovRegisterMemoryToSegmentRegisterInstruction
  | PopRegisterMemoryInstruction
  | XchgRegisterWithAccumulatorInstruction
  | CbwConvertByteToWordInstruction
  | CwdConvertWordToDoubleWordInstruction
  | CallDirectIntersegmentInstruction
  | WaitInstruction
  | PushfPushFlagsInstruction
  | PopfPopFlagsInstruction
  | SahfStoreAhIntoFlagsInstruction
  | LahfLoadAhWithFlagsInstruction
  | MovMemoryToAccumulatorInstruction
  | MovAccumulatorToMemoryInstruction
  | MovsMoveByteWordInstruction
  | CmpsCompareByteWordInstruction
  | TestImmediateWithAccumulatorInstruction
  | StosStoreByteWordFromAlAxInstruction
  | LodsLoadByteWordFromAlAxInstruction
  | ScasScanByteWordInstruction
  | MovImmediateToRegisterInstruction
  | RetWithinSegAddingImmedToSpInstruction
  | RetWithinSegmentInstruction
  | LesLoadPointerToEsInstruction
  | LdsLoadPointerToDsInstruction
  | MovImmediateToRegisterMemoryInstruction
  | RetIntersegmentAddingImmediateToSpInstruction
  | RetIntersegmentInstruction
  | IntType3Instruction
  | IntTypeSpecifiedInstruction
  | IntoInterruptOnOverflowInstruction
  | IretInterruptReturnInstruction
  | LogicWithOneOrClInstruction
  | AamAsciiAdjustForMultipleInstruction
  | AadAsciiAdjustForDivideInstruction
  | XlatTranslateByteToAlInstruction
  | EscEscapeToExternalDeviceInstruction
  | LoopOrJumpCxInstuction
  | InFixedPortInstruction
  | OutFixedPortInstruction
  | CallDirectWithinSegmentInstruction
  | JmpDirectWithinSegmentInstruction
  | JmpDirectIntersegmentInstruction
  | JmpDirectWithinSegmentShortInstruction
  | OutVariablePortInstruction
  | InVariablePortInstruction
  | HltHaltInstruction
  | CmcComplementCarryInstruction
  | TestImmediateDataAndRegisterMemoryInstruction
  | SingleOperandMathInstruction
  | ClcClearCarryInstruction
  | StcSetCarryInstruction
  | CliClearInterruptInstruction
  | StiSetInterruptInstruction
  | CldClearDirectionInstruction
  | StdSetDirectionInstruction
  | MiscFfByteInstruction
  | NotUsedInstruction
  | UnknownInstruction;

const byteLengthKey = 'byteLength';
export type DecodedInstruction = DecodedInstructionInternal & { readonly [byteLengthKey]: number };

export type RegisterOrEacCategory = Register | EffectiveAddressCalculationCategory;

export interface EffectiveAddressCalculation {
  readonly kind: 'mem';
  readonly calculationKind: EffectiveAddressCalculationCategory['calculationKind'];
  readonly displacement: number | null;
  readonly segmentOverridePrefix?: SegmentRegister;
  readonly length: 2 | 1 | null;
}

export type RegisterOrEac = Register | EffectiveAddressCalculation;

// 70 - 7f in table 4-13
const shortLabelJumpInstructionTable: ReadonlyArray<ShortLabelJumpInstruction['kind']> = [
  // 0000
  'joJumpOnOverflow',
  // 0001
  'jnoJumpOnNotOverflow',
  // 0010
  'jbJumpOnBelow',
  // 0011
  'jnbJumpOnNotBelow',
  // 0100
  'jeJumpOnEqual',
  // 0101
  'jneJumpOnNotEqual',
  // 0110
  'jnaJumpOnNotAbove',
  // 0111
  'jaJumpOnAbove',
  // 1000
  'jsJumpOnSign',
  // 1001
  'jnsJumpOnNotSign',
  // 1010
  'jpJumpOnParity',
  // 1011
  'jnpJumpOnNotParity',
  // 1100
  'jlJumpOnLess',
  // 1101
  'jnlJumpOnNotLess',
  // 1110
  'jngJumpOnNotGreater',
  // 1111
  'jgJumpOnGreater',
];

const standardArithmeticLogicImmediateToRegisterMemoryInstructionTable: ReadonlyArray<
  ArithmeticLogicImmediateToRegisterMemoryInstruction['kind']
> = [
  // 000
  'addImmediateToRegisterMemory',
  // 001
  'orImmediateToRegisterMemory',
  // 010
  'adcImmediateToRegisterMemory',
  // 011
  'sbbImmediateToRegisterMemory',
  // 100
  'andImmediateToRegisterMemory',
  // 101
  'subImmediateToRegisterMemory',
  // 110
  'xorImmediateToRegisterMemory',
  // 111
  'cmpImmediateToRegisterMemory',
];

const standardLogicWithOneOrClInstructionTable: ReadonlyArray<
  LogicWithOneOrClInstruction['kind'] | NotUsedInstruction['kind']
> = [
  // 000
  'rolRotateLeft',
  // 001
  'rorRotateRight',
  // 010
  'rclRotateThroughCarryFlagLeft',
  // 011
  'rcrRotateThroughCarryRight',
  // 100
  'salShiftLogicalArithmeticLeft',
  // 101
  'shrShiftLogicalRight',
  // 110
  'NOT USED',
  // 111
  'sarShiftArithmeticRight',
];

const loopOrJumpCxInstructionTable: ReadonlyArray<LoopOrJumpCxInstuction['kind']> = [
  // 00
  'loopneLoopWhileNotEqual',
  // 01
  'loopeLoopWhileEqual',
  // 10
  'loopLoopCxTimes',
  // 11
  'jcxzJumpOnCxZero',
];

const singleOperandMathInstructionTable: ReadonlyArray<
  SingleOperandMathInstruction['kind'] | NotUsedInstruction['kind']
> = [
  // 000
  'NOT USED',
  // 001
  'NOT USED',
  // 010
  'notInvert',
  // 011
  'negChangeSign',
  // 100
  'mulMultiplyUnsigned',
  // 101
  'imulIntegerMultiplySigned',
  // 110
  'divDivideUnsigned',
  // 111
  'idivIntegerDivideSigned',
];

const miscFfByteInstructionTable: ReadonlyArray<
  MiscFfByteInstruction['kind'] | NotUsedInstruction['kind']
> = [
  // 000
  'incRegisterMemory',
  // 001
  'decRegisterMemory',
  // 010
  'callIndirectWithinSegment',
  // 011
  'callIndirectIntersegment',
  // 100
  'jmpIndirectWithinSegment',
  // 101
  'jmpIndirectIntersegment',
  // 110
  'pushRegisterMemory',
  // 111
  'NOT USED',
];

type RepPrefix = 'rep ' | 'repne ';

class DecodingContext {
  index = 0;

  instructionStartIndex: number | null = 0;

  private _segmentOverridePrefix?: SegmentRegister;

  set segmentOverridePrefix(val: SegmentRegister | undefined) {
    if (val !== undefined && this._segmentOverridePrefix !== undefined) {
      throw Error('Attempted to set segment register override prefix context when already set!');
    }

    this._segmentOverridePrefix = val;
  }

  get segmentOverridePrefix(): SegmentRegister | undefined {
    return this._segmentOverridePrefix;
  }

  private _lock = false;

  set lock(val: boolean) {
    if (val && this._lock) {
      throw Error('Attempted to set lock context when already set!');
    }

    this._lock = val;
  }

  get lock(): boolean {
    return this._lock;
  }

  private _rep?: RepPrefix;

  set rep(val: RepPrefix | undefined) {
    if (val !== undefined && this._rep !== undefined) {
      throw Error('Attempted to set rep context when already set!');
    }

    this._rep = val;
  }

  get rep(): RepPrefix | undefined {
    return this._rep;
  }

  constructor(public readonly instructionBytes: InstructionBytes) {}
}

type InstructionBytes = Uint8Array;

export function decodeInstructions(
  instructionBytes: InstructionBytes,
): ReadonlyMap<number, DecodedInstruction> {
  const instructions = new Map<number, DecodedInstruction>();

  const context = new DecodingContext(instructionBytes);

  while (context.index < instructionBytes.length) {
    instructions.set(context.index, decodeInstruction(context));
  }

  return instructions;
}

function decodeInstruction(context: DecodingContext): DecodedInstruction {
  if (context.instructionStartIndex === null) {
    context.instructionStartIndex = context.index;
  }

  const firstByte = context.instructionBytes[context.index];

  let instruction: DecodedInstructionInternal;

  switch (firstByte) {
    // 00 - 03
    // add Register/memory with register to either
    // Layout 0000 00dw
    case 0b0000_0000:
    case 0b0000_0001:
    case 0b0000_0010:
    case 0b0000_0011: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(context);

      instruction = {
        kind: 'addRegisterMemoryWithRegisterToEither',
        op1: dest,
        op2: source,
        lock: consumeLockPrefix(context, dest),
      };

      break;
    }

    // 04 - 05
    // add Immediate to accumulator
    // Layout 0000 010w
    case 0b0000_0100:
    case 0b0000_0101: {
      const [dest, data] = decodeDestDataForImmediateToAccumulatorInstruction(context);

      instruction = {
        kind: 'addImmediateToAccumulator',
        op1: dest,
        op2: data,
      };

      break;
    }

    // 06
    // push Segment register es
    case 0b0000_0110: {
      instruction = {
        kind: 'pushSegmentRegister',
        op1: 'es',
      };

      break;
    }

    // 07
    // pop Segment register es
    case 0b0000_0111: {
      instruction = {
        kind: 'popSegmentRegister',
        op1: 'es',
      };

      break;
    }

    // 08 - 0b
    // or Register/memory and register to either
    // Layout 0000 10dw
    case 0b0000_1000:
    case 0b0000_1001:
    case 0b0000_1010:
    case 0b0000_1011: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(context);

      instruction = {
        kind: 'orRegisterMemoryAndRegisterToEither',
        op1: dest,
        op2: source,
        lock: consumeLockPrefix(context, dest),
      };

      break;
    }

    // 0c - 0d
    // or Immediate to accumulator
    // Layout 0000 110w
    case 0b0000_1100:
    case 0b0000_1101: {
      const [dest, data] = decodeDestDataForImmediateToAccumulatorInstruction(context);

      instruction = {
        kind: 'orImmediateToAccumulator',
        op1: dest,
        op2: data,
      };

      break;
    }

    // 0e
    // push Segment register cs
    case 0b0000_1110: {
      instruction = {
        kind: 'pushSegmentRegister',
        op1: 'cs',
      };

      break;
    }

    // 0f
    // NOT USED - apparently popping cs isn't a thing
    case 0b0000_1111: {
      instruction = {
        kind: 'NOT USED',
        op1: firstByte,
      };

      break;
    }

    // 10 - 13
    // adc Register/memory with register to either
    // Layout 0001 00dw
    case 0b0001_0000:
    case 0b0001_0001:
    case 0b0001_0010:
    case 0b0001_0011: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(context);

      instruction = {
        kind: 'adcRegisterMemoryWithRegisterToEither',
        op1: dest,
        op2: source,
        lock: consumeLockPrefix(context, dest),
      };

      break;
    }

    // 14 - 15
    // adc Immediate to accumulator
    // Layout 0001 010w
    case 0b0001_0100:
    case 0b0001_0101: {
      const [dest, data] = decodeDestDataForImmediateToAccumulatorInstruction(context);

      instruction = {
        kind: 'adcImmediateToAccumulator',
        op1: dest,
        op2: data,
      };

      break;
    }

    // 16
    // push Segment register ss
    case 0b0001_0110: {
      instruction = {
        kind: 'pushSegmentRegister',
        op1: 'ss',
      };

      break;
    }

    // 17
    // pop Segment register SS
    case 0b0001_0111: {
      instruction = {
        kind: 'popSegmentRegister',
        op1: 'ss',
      };

      break;
    }

    // 18 - 1b
    // sbb Register/memory and register to either
    // Layout 0001 10dw
    case 0b0001_1000:
    case 0b0001_1001:
    case 0b0001_1010:
    case 0b0001_1011: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(context);

      instruction = {
        kind: 'sbbRegisterMemoryAndRegisterToEither',
        op1: dest,
        op2: source,
        lock: consumeLockPrefix(context, dest),
      };

      break;
    }

    // 1c - 1d
    // sbb Immediate from accumulator
    // Layout 0001 110w
    case 0b0001_1100:
    case 0b0001_1101: {
      const [dest, data] = decodeDestDataForImmediateToAccumulatorInstruction(context);

      instruction = {
        kind: 'sbbImmediateFromAccumulator',
        op1: dest,
        op2: data,
      };

      break;
    }

    // 1e
    // push Segment register ds
    case 0b0001_1110: {
      instruction = {
        kind: 'pushSegmentRegister',
        op1: 'ds',
      };

      break;
    }

    // 1f
    // pop Segment register ds
    case 0b0001_1111: {
      instruction = {
        kind: 'popSegmentRegister',
        op1: 'ds',
      };

      break;
    }

    // 20 - 23
    // and Register/memory with register to either
    // Layout 0010 00dw
    case 0b0010_0000:
    case 0b0010_0001:
    case 0b0010_0010:
    case 0b0010_0011: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(context);

      instruction = {
        kind: 'andRegisterMemoryWithRegisterToEither',
        op1: dest,
        op2: source,
        lock: consumeLockPrefix(context, dest),
      };

      break;
    }

    // 24 - 25
    // and Immediate to accumulator
    // Layout 0010 010w
    case 0b0010_0100:
    case 0b0010_0101: {
      const [dest, data] = decodeDestDataForImmediateToAccumulatorInstruction(context);

      instruction = {
        kind: 'andImmediateToAccumulator',
        op1: dest,
        op2: data,
      };

      break;
    }

    // 26
    // es Segment override prefix
    // cursed: recurse (only 1 depth) and attach to the next instruction
    case 0b0010_0110: {
      context.segmentOverridePrefix = 'es';

      context.index++;

      return decodeInstruction(context);
    }

    // 27
    // daa Decimal adjust for add
    case 0b0010_0111: {
      instruction = {
        kind: 'daaDecimalAdjustForAdd',
      };

      break;
    }

    // 28 - 2b
    // sub Register/memory and register to either
    // Layout 0010 10dw
    case 0b0010_1000:
    case 0b0010_1001:
    case 0b0010_1010:
    case 0b0010_1011: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(context);

      instruction = {
        kind: 'subRegisterMemoryAndRegisterToEither',
        op1: dest,
        op2: source,
        lock: consumeLockPrefix(context, dest),
      };

      break;
    }

    // 2c - 2d
    // sub Immediate from accumulator
    // Layout 0010 110w
    case 0b0010_1100:
    case 0b0010_1101: {
      const [dest, data] = decodeDestDataForImmediateToAccumulatorInstruction(context);

      instruction = {
        kind: 'subImmediateFromAccumulator',
        op1: dest,
        op2: data,
      };

      break;
    }

    // 2e
    // cs Segment override prefix
    // cursed: recurse (only 1 depth) and attach to the next instruction
    case 0b0010_1110: {
      context.segmentOverridePrefix = 'cs';

      context.index++;

      return decodeInstruction(context);
    }

    // 2f
    // das Decimal adjust for subtract
    case 0b0010_1111: {
      instruction = {
        kind: 'dasDecimalAdjustForSubtract',
      };

      break;
    }

    // 30 - 33
    // xor Register/memory and register to either
    // Layout 0011 00dw
    case 0b0011_0000:
    case 0b0011_0001:
    case 0b0011_0010:
    case 0b0011_0011: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(context);

      instruction = {
        kind: 'xorRegisterMemoryAndRegisterToEither',
        op1: dest,
        op2: source,
        lock: consumeLockPrefix(context, dest),
      };

      break;
    }

    // 34 - 35
    // xor Immediate to accumulator
    // Layout 0011 010w
    case 0b0011_0100:
    case 0b0011_0101: {
      const [dest, data] = decodeDestDataForImmediateToAccumulatorInstruction(context);

      instruction = {
        kind: 'xorImmediateToAccumulator',
        op1: dest,
        op2: data,
      };

      break;
    }

    // 36
    // ss Segment override prefix
    // cursed: recurse (only 1 depth) and attach to the next instruction
    case 0b0011_0110: {
      context.segmentOverridePrefix = 'ss';

      context.index++;

      return decodeInstruction(context);
    }

    // 37
    // aaa ASCII adjust for add
    case 0b0011_0111: {
      instruction = {
        kind: 'aaaAsciiAdjustForAdd',
      };

      break;
    }

    // 38 - 3b
    // cmp Register/memory and register
    // Layout 0011 10dw
    case 0b0011_1000:
    case 0b0011_1001:
    case 0b0011_1010:
    case 0b0011_1011: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(context);

      instruction = {
        kind: 'cmpRegisterMemoryAndRegister',
        op1: dest,
        op2: source,
      };

      break;
    }

    // 3c - 3d
    // cmp Immediate with accumulator
    // Layout 0011 110w
    case 0b0011_1100:
    case 0b0011_1101: {
      const [dest, data] = decodeDestDataForImmediateToAccumulatorInstruction(context);

      instruction = {
        kind: 'cmpImmediateWithAccumulator',
        op1: dest,
        op2: data,
      };

      break;
    }

    // 3e
    // ds Segment override prefix
    // cursed: recurse (only 1 depth) and attach to the next instruction
    case 0b0011_1110: {
      context.segmentOverridePrefix = 'ds';

      context.index++;

      return decodeInstruction(context);
    }

    // 3f
    // aas ASCII adjust for subtract
    case 0b0011_1111: {
      instruction = {
        kind: 'aasAsciiAdjustForSubtract',
      };

      break;
    }

    // 40 - 47
    // inc Register
    // Layout 0100 0rrr   (r = reg)
    case 0b0100_0000:
    case 0b0100_0001:
    case 0b0100_0010:
    case 0b0100_0011:
    case 0b0100_0100:
    case 0b0100_0101:
    case 0b0100_0110:
    case 0b0100_0111: {
      const register = wordRegisterDecodingTable[firstByte & 0b0000_0111];

      instruction = {
        kind: 'incRegister',
        op1: register,
      };

      break;
    }

    // 48 - 4f
    // dec Register
    // Layout 0100 1rrr   (r = reg)
    case 0b0100_1000:
    case 0b0100_1001:
    case 0b0100_1010:
    case 0b0100_1011:
    case 0b0100_1100:
    case 0b0100_1101:
    case 0b0100_1110:
    case 0b0100_1111: {
      const register = wordRegisterDecodingTable[firstByte & 0b0000_0111];

      instruction = {
        kind: 'decRegister',
        op1: register,
      };

      break;
    }

    // 50 - 58
    // push Register
    // Layout 0101 0rrr   (r = reg)
    case 0b0101_0000:
    case 0b0101_0001:
    case 0b0101_0010:
    case 0b0101_0011:
    case 0b0101_0100:
    case 0b0101_0101:
    case 0b0101_0110:
    case 0b0101_0111: {
      const register = wordRegisterDecodingTable[firstByte & 0b0000_0111];

      instruction = {
        kind: 'pushRegister',
        op1: register,
      };

      break;
    }

    // 58 - 5f
    // pop Register
    // Layout 0101 1rrr   (r = reg)
    case 0b0101_1000:
    case 0b0101_1001:
    case 0b0101_1010:
    case 0b0101_1011:
    case 0b0101_1100:
    case 0b0101_1101:
    case 0b0101_1110:
    case 0b0101_1111: {
      const register = wordRegisterDecodingTable[firstByte & 0b0000_0111];

      instruction = {
        kind: 'popRegister',
        op1: register,
      };

      break;
    }

    // 60 - 6f
    // NOT USED
    case 0b0110_0000:
    case 0b0110_0001:
    case 0b0110_0010:
    case 0b0110_0011:
    case 0b0110_0100:
    case 0b0110_0101:
    case 0b0110_0110:
    case 0b0110_0111:
    case 0b0110_1000:
    case 0b0110_1001:
    case 0b0110_1010:
    case 0b0110_1011:
    case 0b0110_1100:
    case 0b0110_1101:
    case 0b0110_1110:
    case 0b0110_1111: {
      instruction = {
        kind: 'NOT USED',
        op1: firstByte,
      };

      break;
    }

    // 70 - 7f
    // Various short label jumps
    // Layout 0111 iiii   (i = index into a table of these)
    // We normalize these to never include equal and some other condition, i.e. "not above" rather than "below or equal"
    case 0b0111_0000:
    case 0b0111_0001:
    case 0b0111_0010:
    case 0b0111_0011:
    case 0b0111_0100:
    case 0b0111_0101:
    case 0b0111_0110:
    case 0b0111_0111:
    case 0b0111_1000:
    case 0b0111_1001:
    case 0b0111_1010:
    case 0b0111_1011:
    case 0b0111_1100:
    case 0b0111_1101:
    case 0b0111_1110:
    case 0b0111_1111: {
      context.index++;

      instruction = {
        kind: shortLabelJumpInstructionTable[firstByte & 0b0000_1111],
        op1: getAsTwosComplement(context.instructionBytes[context.index], 127),
      };

      break;
    }

    // 80 - 83
    // Standard arithmetic/logic instructions (add, or, adc, sbb, and, sub, xor, cmp)
    // Immediate to register/memory
    // Layout 1000 00sw
    case 0b1000_0000:
    case 0b1000_0001:
    case 0b1000_0010:
    case 0b1000_0011: {
      const wBit = firstByte & 0b0000_0001;
      const sBit = firstByte & 0b0000_0010;

      const [opCodeBits, destRm] = decodeMiddleThreeBitsAndModRm(context, wBit);

      const instructionKind =
        standardArithmeticLogicImmediateToRegisterMemoryInstructionTable[opCodeBits >> 3];

      // TODO Manual claims that this (sBit set with or/and/xor) shouldn't be possible,
      // but nasm will produce these bytes even with cpu 8086, so let this through but
      // maybe raise a warning or something later
      // if (
      //   sBit &&
      //   (instructionKind === 'orImmediateToRegisterMemory' ||
      //     instructionKind === 'andImmediateToRegisterMemory' ||
      //     instructionKind === 'xorImmediateToRegisterMemory')
      // ) {
      //   raise a warning or something?
      // }

      const dest = decodeRegisterOrEffectiveAddressCalculation(context, destRm, wBit ? 2 : 1);

      const wBitForDataDecode = wBit && !sBit ? 1 : 0;

      let data = decodeIntLiteralData(context, wBitForDataDecode);

      if (sBit) {
        // This is maybe dodgy. It's the only way we get negative values into data,
        // and that requires special casing in the encoder and simulator to handle correctly.
        // Although the sBit is just kinda cursed so perhaps this is the best way - the encoder
        // would have to do some equally cursed stuff to get the right bytes out if we didn't
        // do this.
        data = getAsTwosComplement(data, 127);
      }

      instruction = {
        kind: instructionKind,
        op1: dest,
        op2: data,
        lock: consumeLockPrefix(context, dest),
      };

      break;
    }

    // 84 - 85
    // test Register/memory and register
    // Layout 1000 010w
    case 0b1000_0100:
    case 0b1000_0101: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(context);

      if (source.kind === 'mem') {
        throw Error('Got memory source for test register/memory and register instruction');
      }

      instruction = {
        kind: 'testRegisterMemoryAndRegister',
        op1: dest,
        op2: source,
      };

      break;
    }

    // 86 = 87
    // xchg Register/memory with register
    // Layout 1000 011w
    case 0b1000_0110:
    case 0b1000_0111: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(context);

      if (dest.kind === 'mem') {
        throw Error('Got memory dest for xchg register/memory with register instruction');
      }

      // Don't use consumeLockPrefix, as we can lock even if source is mem (I think)
      const lock = context.lock;

      context.lock = false;

      if (lock && source.kind === 'mem') {
        // Swap mem to be the dest if locked because nasm doesn't like it otherwise
        // https://bugzilla.nasm.us/show_bug.cgi?id=3392838#c2

        instruction = {
          kind: 'xchgRegisterMemoryWithRegister',
          op1: source,
          op2: dest,
          lock,
        };

        break;
      }

      instruction = {
        kind: 'xchgRegisterMemoryWithRegister',
        op1: dest,
        op2: source,
        lock,
      };

      break;
    }

    // 88 - 8b
    // mov Register/memory to/from register
    // Layout 1000 10dw
    case 0b1000_1000:
    case 0b1000_1001:
    case 0b1000_1010:
    case 0b1000_1011: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(context);

      instruction = {
        kind: 'movRegisterMemoryToFromRegister',
        op1: dest,
        op2: source,
      };

      break;
    }

    // 8c
    // mov Segment register to register/memory
    case 0b1000_1100: {
      const [srBits, destRm] = decodeMiddleThreeBitsAndModRm(context, 1);

      if (srBits & 0b0010_0000) {
        throw Error(
          'Got segment register to register memory instruction where third bit of second byte was set',
        );
      }

      const source = segmentRegisterDecodingTable[srBits >> 3];

      const dest = decodeRegisterOrEffectiveAddressCalculation(context, destRm, null);

      instruction = {
        kind: 'movSegmentRegisterToRegisterMemory',
        op1: dest,
        op2: source,
      };

      break;
    }

    // 8d
    // lea Load EA to register
    case 0b1000_1101: {
      const [dest, sourceCategory] = decodeModRegRm(context, 1);

      if (!isWordRegister(dest)) {
        throw Error('Interal error - got non-word register in lea');
      }

      if (sourceCategory.kind === 'reg') {
        throw Error(
          "Got register source for lea instruction. Seems like this shouldn't be possible",
        );
      }

      const source = decodeEffectiveAddressCalculation(context, sourceCategory, null);

      instruction = {
        kind: 'leaLoadEaToRegister',
        op1: dest,
        op2: source,
      };

      break;
    }

    // 8e
    // mov Register/memory to segment register
    case 0b1000_1110: {
      const [srBits, sourceRm] = decodeMiddleThreeBitsAndModRm(context, 1);

      if (srBits & 0b0010_0000) {
        throw Error(
          'Got mov segment register to register memory instruction where third bit of second byte was set',
        );
      }

      const dest = segmentRegisterDecodingTable[srBits >> 3];

      const source = decodeRegisterOrEffectiveAddressCalculation(context, sourceRm, null);

      instruction = {
        kind: 'movRegisterMemoryToSegmentRegister',
        op1: dest,
        op2: source,
      };

      break;
    }

    // 8f
    // pop Register/memory
    case 0b1000_1111: {
      const [middleBits, destRm] = decodeMiddleThreeBitsAndModRm(context, 1);

      if (middleBits !== 0) {
        throw Error(
          'Got pop register/memory instruction with non-zero "reg" middle bits in second byte',
        );
      }

      const dest = decodeRegisterOrEffectiveAddressCalculation(context, destRm, 2);

      instruction = {
        kind: 'popRegisterMemory',
        op1: dest,
      };

      break;
    }

    // 90
    // xchg ax, ax (nop in the manual, but nasm compiles xchg ax, ax to these bytes)
    // 91 - 97
    // xchg Register with accumulator
    // Layout 1001 0rrr    (r = word register)
    case 0b1001_0000:
    case 0b1001_0001:
    case 0b1001_0010:
    case 0b1001_0011:
    case 0b1001_0100:
    case 0b1001_0101:
    case 0b1001_0110:
    case 0b1001_0111: {
      const source = wordRegisterDecodingTable[firstByte & 0b0000_0111];

      instruction = {
        kind: 'xchgRegisterWithAccumulator',
        op1: axReg,
        op2: source,
      };

      break;
    }

    // 98
    // cbw Convert byte to word
    case 0b1001_1000: {
      instruction = {
        kind: 'cbwConvertByteToWord',
      };

      break;
    }

    // 99
    // cwd Convert word to double word
    case 0b1001_1001: {
      instruction = {
        kind: 'cwdConvertWordToDoubleWord',
      };

      break;
    }

    // 9a
    // call Direct intersegment
    case 0b1001_1010: {
      const ip = decodeIntLiteralData(context, 1);
      const cs = decodeIntLiteralData(context, 1);

      instruction = {
        kind: 'callDirectIntersegment',
        op1: ip,
        op2: cs,
      };

      break;
    }

    // 9b
    // wait
    case 0b1001_1011: {
      instruction = {
        kind: 'wait',
      };

      break;
    }

    // 9c
    // pushf Push flags
    case 0b1001_1100: {
      instruction = {
        kind: 'pushfPushFlags',
      };

      break;
    }

    // 9d
    // popf Pop flags
    case 0b1001_1101: {
      instruction = {
        kind: 'popfPopFlags',
      };

      break;
    }

    // 9e
    // sahf Store AH into flags
    case 0b1001_1110: {
      instruction = {
        kind: 'sahfStoreAhIntoFlags',
      };

      break;
    }

    // 9f
    //lahf Load AH with flags
    case 0b1001_1111: {
      instruction = {
        kind: 'lahfLoadAhWithFlags',
      };

      break;
    }

    // a0 - a3
    // mov Memory to/from accumulator
    // Layout 101000dw   except d is backwards from it's normal meaning lol
    case 0b1010_0000:
    case 0b1010_0001:
    case 0b1010_0010:
    case 0b1010_0011: {
      const isAccToMem = (firstByte & 0b0000_0010) === 0b0000_0010;
      const wBit = (firstByte & 0b0000_0001) === 0b0000_0001;

      const reg = wBit ? axReg : alReg;

      const displacement = decodeIntLiteralData(context, 1);

      const memoryAddressCalculation = {
        kind: 'mem',
        calculationKind: 'DIRECT ADDRESS',
        displacement,
        length: null,
      } satisfies EffectiveAddressCalculation;

      if (isAccToMem) {
        instruction = {
          kind: 'movAccumulatorToMemory',
          op1: memoryAddressCalculation,
          op2: reg,
        };
      } else {
        instruction = {
          kind: 'movMemoryToAccumulator',
          op1: reg,
          op2: memoryAddressCalculation,
        };
      }

      break;
    }

    // a4 - a5
    // movs Move byte/word
    case 0b1010_0100:
    case 0b1010_0101: {
      instruction = {
        kind: 'movsMoveByteWord',
        word: !!(firstByte & 0b0000_0001),
        rep: consumeRepPrefix(context),
      };

      break;
    }

    // a6 - a7
    // cmps Compare byte/word
    case 0b1010_0110:
    case 0b1010_0111: {
      instruction = {
        kind: 'cmpsCompareByteWord',
        word: !!(firstByte & 0b0000_0001),
        rep: consumeRepPrefix(context),
      };

      break;
    }

    // a8 - a9
    // test Immediate data with accumulator
    // Layout 1010 100w
    case 0b1010_1000:
    case 0b1010_1001: {
      const wBit = firstByte & 0b0000_0001;

      const dest = wBit ? axReg : alReg;

      const data = decodeIntLiteralData(context, wBit);

      instruction = {
        kind: 'testImmediateWithAccumulator',
        op1: dest,
        op2: data,
      };

      break;
    }

    // aa - ab
    // stos Store byte/word from AL/AX
    case 0b1010_1010:
    case 0b1010_1011: {
      instruction = {
        kind: 'stosStoreByteWordFromAlAx',
        word: !!(firstByte & 0b0000_0001),
        rep: consumeRepPrefix(context),
      };

      break;
    }

    // ac - ad
    // lods
    case 0b1010_1100:
    case 0b1010_1101: {
      instruction = {
        kind: 'lodsLoadByteWordFromAlAx',
        word: !!(firstByte & 0b0000_0001),
        rep: consumeRepPrefix(context),
      };

      break;
    }

    // ae - af
    // scas
    case 0b1010_1110:
    case 0b1010_1111: {
      instruction = {
        kind: 'scasScanByteWord',
        word: !!(firstByte & 0b0000_0001),
        rep: consumeRepPrefix(context),
      };

      break;
    }

    // b0 - bf
    // mov Immediate to register
    // Layout 1011 wrrr   (r = reg)
    case 0b1011_0000:
    case 0b1011_0001:
    case 0b1011_0010:
    case 0b1011_0011:
    case 0b1011_0100:
    case 0b1011_0101:
    case 0b1011_0110:
    case 0b1011_0111:
    case 0b1011_1000:
    case 0b1011_1001:
    case 0b1011_1010:
    case 0b1011_1011:
    case 0b1011_1100:
    case 0b1011_1101:
    case 0b1011_1110:
    case 0b1011_1111: {
      const wBit = (firstByte & 0b0000_1000) === 0b0000_1000 ? 1 : 0;
      const dest = registerDecodingTable[((firstByte & 0b0000_0111) << 1) | wBit];

      const data = decodeIntLiteralData(context, wBit);

      instruction = {
        kind: 'movImmediateToRegister',
        op1: dest,
        op2: data,
      };

      break;
    }

    // c0 - c1
    // NOT USED
    case 0b1100_0000:
    case 0b1100_0001: {
      instruction = {
        kind: 'NOT USED',
        op1: firstByte,
      };

      break;
    }

    // c2
    // ret Within seg adding immed to SP
    case 0b1100_0010: {
      const data = decodeIntLiteralData(context, 1);

      instruction = {
        kind: 'retWithinSegAddingImmedToSp',
        op1: data,
      };

      break;
    }

    // c3
    // ret Within seg
    case 0b1100_0011: {
      instruction = {
        kind: 'retWithinSegment',
      };

      break;
    }

    // c4 - c5
    // les Load pointer to ES
    // lds load pointer to DS
    case 0b1100_0100:
    case 0b1100_0101: {
      const [regBits, sourceEacCategory] = decodeMiddleThreeBitsAndModRm(context, 1);

      if (sourceEacCategory.kind === 'reg') {
        throw Error("les instruction got register source. Don't think this is allowed.");
      }

      const dest = wordRegisterDecodingTable[regBits >> 3];

      const source = decodeEffectiveAddressCalculation(context, sourceEacCategory, null);

      instruction = {
        kind: 0b0000_0001 & firstByte ? 'ldsLoadPointerToDs' : 'lesLoadPointerToEs',
        op1: dest,
        op2: source,
      };

      break;
    }

    // c6 - c7
    // mov Immediate to register/memory
    // Layout 1100 011w
    case 0b1100_0110:
    case 0b1100_0111: {
      const wBit = firstByte & 0b0000_0001;

      const [reg, destRm] = decodeModRegRm(context, wBit);

      if (reg.name !== 'al' && reg.name !== 'ax') {
        throw new Error(
          'Encounted immediate move to register memory with non-000 reg in mod reg r/m byte. See table 4-13 C6/C7',
        );
      }

      const dest = decodeRegisterOrEffectiveAddressCalculation(context, destRm, wBit ? 2 : 1);

      const data = decodeIntLiteralData(context, wBit);

      instruction = {
        kind: 'movImmediateToRegisterMemory',
        op1: dest,
        op2: data,
      };

      break;
    }

    // c8 - c9
    // NOT USED
    case 0b1100_1000:
    case 0b1100_1001: {
      instruction = {
        kind: 'NOT USED',
        op1: firstByte,
      };

      break;
    }

    // ca
    // ret Intersegment adding immediate to SP
    case 0b1100_1010: {
      const data = decodeIntLiteralData(context, 1);

      instruction = {
        kind: 'retIntersegmentAddingImmediateToSp',
        op1: data,
      };

      break;
    }

    // cb
    // ret Intersegment
    case 0b1100_1011: {
      instruction = {
        kind: 'retIntersegment',
      };

      break;
    }

    // cc
    // int Type 3
    case 0b1100_1100: {
      instruction = {
        kind: 'intType3',
      };

      break;
    }

    // cd
    // int Type specified
    case 0b1100_1101: {
      const data = decodeIntLiteralData(context, 0);

      instruction = {
        kind: 'intTypeSpecified',
        op1: data,
      };

      break;
    }

    // ce
    // into Interrupt on overflow
    case 0b1100_1110: {
      instruction = {
        kind: 'intoInterruptOnOverflow',
      };

      break;
    }

    // cf
    // iret Interrupt return
    case 0b1100_1111: {
      instruction = {
        kind: 'iretInterruptReturn',
      };

      break;
    }

    // d0 - d3
    // Standard logic with 1 or register cl instructions (rol, ror, rcl, rcr, sal, shr, sar)
    // Layout 1101 00vw
    case 0b1101_0000:
    case 0b1101_0001:
    case 0b1101_0010:
    case 0b1101_0011: {
      const wBit = firstByte & 0b0000_0001;
      const vBit = firstByte & 0b0000_0010;

      const [opCodeBits, destRm] = decodeMiddleThreeBitsAndModRm(context, wBit);

      const instructionKind = standardLogicWithOneOrClInstructionTable[opCodeBits >> 3];

      if (instructionKind === 'NOT USED') {
        throw Error(
          'Got "logic with 1 or cl" instruction with 110 "reg" middle bits in second byte',
        );
      }

      const dest = decodeRegisterOrEffectiveAddressCalculation(context, destRm, wBit ? 2 : 1);

      const source: LogicWithOneOrClInstruction['op2'] = vBit ? clReg : 1;

      const _instruction: LogicWithOneOrClInstruction = {
        kind: instructionKind,
        op1: dest,
        op2: source,
      };

      instruction = _instruction;

      break;
    }

    // d4
    // aam ASCII adjust for multiply
    case 0b1101_0100: {
      instruction = {
        kind: 'aamAsciiAdjustForMultiply',
      };

      // These guys have an extra byte that is always 0000 1010 because why not lol
      context.index++;

      break;
    }

    // d5
    // aad ASCII adjust for divide
    case 0b1101_0101: {
      instruction = {
        kind: 'aadAsciiAdjustForDivide',
      };

      // These guys have an extra byte that is always 0000 1010 because why not lol
      context.index++;

      break;
    }

    // d6
    // NOT USED
    case 0b1101_0110: {
      instruction = {
        kind: 'NOT USED',
        op1: firstByte,
      };

      break;
    }

    // d7
    // xlat Translate byte to al
    case 0b1101_0111: {
      instruction = {
        kind: 'xlatTranslateByteToAl',
      };

      break;
    }

    // d8 - df
    // esc Escape (to external device)
    // Layout 1101 1xxx   (x = first three bits of esc op code)
    // Dunno, some cursed thing to do with the 8087 co-processor
    case 0b1101_1000:
    case 0b1101_1001:
    case 0b1101_1010:
    case 0b1101_1011:
    case 0b1101_1100:
    case 0b1101_1101:
    case 0b1101_1110:
    case 0b1101_1111: {
      const firstOpCodePart = firstByte & 0b0000_0111;

      const [secondOpCodePart, sourceRm] = decodeMiddleThreeBitsAndModRm(context, 1);

      // I think this is right lol, who knows. The fact that these swap makes me think not,
      // but this seems to be what the manual says
      const fullOpCode = (firstOpCodePart << 3) + (secondOpCodePart >> 3);

      const source = decodeRegisterOrEffectiveAddressCalculation(context, sourceRm, null);

      instruction = {
        kind: 'escEscapeToExternalDevice',
        op1: fullOpCode,
        op2: source,
      };

      break;
    }

    // e0 - e3
    // Loop and jump on cx zero
    case 0b1110_0000:
    case 0b1110_0001:
    case 0b1110_0010:
    case 0b1110_0011: {
      context.index++;

      instruction = {
        kind: loopOrJumpCxInstructionTable[firstByte & 0b0000_0011],
        op1: getAsTwosComplement(context.instructionBytes[context.index], 127),
      };

      break;
    }

    // e4 - e7
    // in/out Fixed port
    case 0b1110_0100:
    case 0b1110_0101:
    case 0b1110_0110:
    case 0b1110_0111: {
      const instructionBit = firstByte & 0b0000_0010;
      const wBit = firstByte & 0b0000_0001;

      const instructionKind: InFixedPortInstruction['kind'] | OutFixedPortInstruction['kind'] =
        instructionBit ? 'outFixedPort' : 'inFixedPort';

      const reg = wBit ? axReg : alReg;

      const data = decodeIntLiteralData(context, 0);

      if (instructionKind === 'inFixedPort') {
        instruction = {
          kind: instructionKind,
          op1: reg,
          op2: data,
        };
      } else {
        instruction = {
          kind: instructionKind,
          op1: data,
          op2: reg,
        };
      }

      break;
    }

    // e8
    // call Direct within segment
    case 0b1110_1000: {
      const ip = decodeIntLiteralData(context, 1);

      instruction = {
        kind: 'callDirectWithinSegment',
        op1: ip,
      };

      break;
    }

    // e9
    // jmp Direct within segment
    case 0b1110_1001: {
      const ip = decodeIntLiteralData(context, 1);

      instruction = {
        kind: 'jmpDirectWithinSegment',
        op1: ip,
      };

      break;
    }

    // ea
    // jmp Direct intersegment
    case 0b1110_1010: {
      const ip = decodeIntLiteralData(context, 1);
      const cs = decodeIntLiteralData(context, 1);

      instruction = {
        kind: 'jmpDirectIntersegment',
        op1: ip,
        op2: cs,
      };

      break;
    }

    // eb
    // jmp Direct within segment short
    case 0b1110_1011: {
      const ip = decodeIntLiteralData(context, 0);

      instruction = {
        kind: 'jmpDirectWithinSegmentShort',
        op1: ip,
      };

      break;
    }

    // ec - ef
    // in/out Variable port
    case 0b1110_1100:
    case 0b1110_1101:
    case 0b1110_1110:
    case 0b1110_1111: {
      const instructionBit = firstByte & 0b0000_0010;
      const wBit = firstByte & 0b0000_0001;

      const instructionKind:
        | InVariablePortInstruction['kind']
        | OutVariablePortInstruction['kind'] = instructionBit
        ? 'outVariablePort'
        : 'inVariablePort';

      const reg = wBit ? axReg : alReg;

      if (instructionKind === 'inVariablePort') {
        instruction = {
          kind: instructionKind,
          op1: reg,
          op2: dxReg,
        };
      } else {
        instruction = {
          kind: instructionKind,
          op1: dxReg,
          op2: reg,
        };
      }

      break;
    }

    // f0
    // lock prefix
    // recurse (only 1 depth) and attach to the next instruction
    case 0b1111_0000: {
      context.lock = true;

      context.index++;

      return decodeInstruction(context);
    }

    // f1
    // NOT USED
    case 0b1111_0001: {
      instruction = {
        kind: 'NOT USED',
        op1: firstByte,
      };

      break;
    }

    // f2
    // repne prefix
    // recurse (only 1 depth) and attach to the next instruction
    case 0b1111_0010: {
      context.rep = 'repne ';

      context.index++;

      return decodeInstruction(context);
    }

    // f3
    // rep prefix
    // recurse (only 1 depth) and attach to the next instruction
    case 0b1111_0011: {
      context.rep = 'rep ';

      context.index++;

      return decodeInstruction(context);
    }

    // f4
    // hlt Halt
    case 0b1111_0100: {
      instruction = {
        kind: 'hltHalt',
      };

      break;
    }

    // f5
    // cmc Complement carry
    case 0b1111_0101: {
      instruction = {
        kind: 'cmcComplementCarry',
      };

      break;
    }

    // f6 - f7
    // test or single register math instruction
    // Layout 1111 011w
    case 0b1111_0110:
    case 0b1111_0111: {
      const wBit = firstByte & 0b0000_0001;

      const [opCodeBits, destRm] = decodeMiddleThreeBitsAndModRm(context, wBit);

      const dest = decodeRegisterOrEffectiveAddressCalculation(context, destRm, wBit ? 2 : 1);

      // test Immediate data and register/memory
      if (opCodeBits === 0b0000_0000) {
        const data = decodeIntLiteralData(context, wBit);

        instruction = {
          kind: 'testImmediateDataAndRegisterMemory',
          op1: dest,
          op2: data,
        };

        break;
      } else {
        const instructionKind = singleOperandMathInstructionTable[opCodeBits >> 3];

        if (instructionKind === 'NOT USED') {
          throw Error(
            'Got "single operand math instruction" with "reg" middle bits 001 in second byte',
          );
        }

        const lock = consumeLockPrefix(context, dest);
        if (lock && instructionKind !== 'negChangeSign' && instructionKind !== 'notInvert') {
          throw Error('This instruction is not lockable');
        }

        instruction = {
          kind: instructionKind,
          op1: dest,
          lock,
        };

        break;
      }
    }

    // f8
    // clc Clear carry
    case 0b1111_1000: {
      instruction = {
        kind: 'clcClearCarry',
      };

      break;
    }

    // f9
    // stc Set carry
    case 0b1111_1001: {
      instruction = {
        kind: 'stcSetCarry',
      };

      break;
    }

    // fa
    // cli Clear interrupt
    case 0b1111_1010: {
      instruction = {
        kind: 'cliClearInterrupt',
      };

      break;
    }

    // fb
    // sti Set interrupt
    case 0b1111_1011: {
      instruction = {
        kind: 'stiSetInterrupt',
      };

      break;
    }

    // fc
    // cld Clear direction
    case 0b1111_1100: {
      instruction = {
        kind: 'cldClearDirection',
      };

      break;
    }

    // fd
    // std Set direction
    case 0b1111_1101: {
      instruction = {
        kind: 'stdSetDirection',
      };

      break;
    }

    // fe - ff
    // Various (inc, dec, call, jmp, push)
    case 0b1111_1110:
    case 0b1111_1111: {
      const wBit = firstByte & 0b0000_0001;

      const [opCodeBits, destRm] = decodeMiddleThreeBitsAndModRm(context, wBit);

      const dest = decodeRegisterOrEffectiveAddressCalculation(context, destRm, wBit ? 2 : 1);

      const instructionKind = miscFfByteInstructionTable[opCodeBits >> 3];

      if (!wBit && opCodeBits !== 0b0000_0000 && opCodeBits !== 0b0000_1000) {
        throw Error('Got first byte 1111 1110 with invalid "reg" middle bits (not 000 or 001)');
      } else if (instructionKind === 'NOT USED') {
        throw Error('Got first byte 1111 111w with "reg" middle bits 111 in second byte');
      }

      // These appear to be legit only allowed with registers
      if (
        instructionKind === 'callIndirectIntersegment' ||
        instructionKind === 'jmpIndirectIntersegment'
      ) {
        if (dest.kind === 'reg') {
          throw Error('Got register operand with call or jmp direct intersegment');
        }

        instruction = {
          kind: instructionKind,
          op1: dest,
        };
      } else {
        const lock = consumeLockPrefix(context, dest);
        if (
          lock &&
          instructionKind !== 'decRegisterMemory' &&
          instructionKind !== 'incRegisterMemory'
        ) {
          throw Error('This instruction is not lockable');
        }

        instruction = {
          kind: instructionKind,
          op1: dest,
          lock,
        };
      }

      break;
    }

    default:
      instruction = { kind: 'UNKNOWN' };
  }

  context.index++;

  // nasm will allow you to just have a floating prefix wherever you want, basically.
  // For now at least, we're going to be more strict and say that locks and reps have to
  // be before an appropriate instruction, and segment overrides have to be before
  // a memory operand.
  if (context.segmentOverridePrefix !== undefined) {
    throw Error('Unconsumed segment register prefix');
  }

  if (context.lock) {
    throw Error('Unconsumed lock - This instruction is not lockable');
  }

  if (context.rep !== undefined) {
    throw Error('Unconsumed rep - This instruction is not rep-able');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (instruction as any)[byteLengthKey] = context.index - context.instructionStartIndex;
  context.instructionStartIndex = null;

  return instruction as DecodedInstruction;
}

function decodeDestSourceForModRegRmInstruction(
  context: DecodingContext,
): [RegisterOrEac, RegisterOrEac] {
  const dBit = context.instructionBytes[context.index] & 0b0000_0010;
  const wBit = context.instructionBytes[context.index] & 0b0000_0001;

  const [reg, rm] = decodeModRegRm(context, wBit);

  const destRm = dBit ? reg : rm;
  const sourceRm = dBit ? rm : reg;

  let dest: RegisterOrEac;
  let source: RegisterOrEac;

  if (destRm.kind === 'eac') {
    assertIsRegister(sourceRm);
    source = sourceRm;

    dest = decodeEffectiveAddressCalculation(context, destRm, null);
  } else if (sourceRm.kind === 'eac') {
    dest = destRm;

    source = decodeEffectiveAddressCalculation(context, sourceRm, null);
  } else {
    dest = destRm;
    source = sourceRm;
  }

  return [dest, source];
}

// mod/reg/rm byte has structure | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
//                               |  mod  |    reg    |     rm    |
//
// wBit is in bit index 7
function decodeModRegRm(context: DecodingContext, wBit: number): [Register, RegisterOrEacCategory] {
  const [regBits, registerOrEacCategory] = decodeMiddleThreeBitsAndModRm(context, wBit);

  // reg bits are index 2, 3, 4. Shift them over 2 and & them with the wBit (last) to get a number in the range 0..16,
  // which is effectively table 4-9
  const regTableLookup = (regBits >> 2) | wBit;
  const reg = registerDecodingTable[regTableLookup];

  return [reg, registerOrEacCategory];
}

function decodeMiddleThreeBitsAndModRm(
  context: DecodingContext,
  wBit: number,
): [number, RegisterOrEacCategory] {
  const byte = context.instructionBytes[++context.index];

  // mod bits are the first two - 11 means that the "register or memory" part is a register,
  // else we'll find an effective address calculation category
  const modRmIsRegister = (0b1100_0000 & byte) === 0b1100_0000;

  const middleThreeBits = 0b0011_1000 & byte;

  if (modRmIsRegister) {
    // If mod is register, we just use different bits to look up into the same reg table (4-9, or the first part of 4-10)
    const rmReg = registerDecodingTable[((byte & 0b0000_0111) << 1) | wBit];

    return [middleThreeBits, rmReg];
  } else {
    // If mod is memory mode (i.e. no register-to-register), use the relevant bits (mod and rm) on the effective address table (4-10)
    const rmEac = effectiveAddressDecodingTable[byte & 0b1100_0111];

    return [middleThreeBits, rmEac];
  }
}

function assertIsRegister(rm: RegisterOrEacCategory): asserts rm is Register {
  if (rm.kind === 'eac') {
    throw new Error(`Expected register, got ${rm.kind} ${rm.calculationKind}`);
  }
}

function decodeRegisterOrEffectiveAddressCalculation(
  context: DecodingContext,
  registerOrEacCategory: RegisterOrEacCategory,
  length: 2 | 1 | null,
): RegisterOrEac {
  if (registerOrEacCategory.kind === 'reg') {
    return registerOrEacCategory;
  } else {
    return decodeEffectiveAddressCalculation(context, registerOrEacCategory, length);
  }
}

// possibleDisplacementBytes could possible be undefined if we're reading the last instruction.
// But in a valid instruction stream we should never have displacement that reads into those bytes, obv
function decodeEffectiveAddressCalculation(
  context: DecodingContext,
  category: EffectiveAddressCalculationCategory,
  length: 2 | 1 | null,
): EffectiveAddressCalculation {
  let displacement: number | null;

  if (category.displacementBytes === 0) {
    displacement = null;
  } else if (category.displacementBytes === 1) {
    displacement = getAsTwosComplement(context.instructionBytes[context.index + 1], 127);
  } else {
    displacement = getAsTwosComplement(
      context.instructionBytes[context.index + 1] +
        (context.instructionBytes[context.index + 2] << 8),
      32767,
    );
  }

  context.index += category.displacementBytes;

  let segmentOverridePrefix: SegmentRegister | undefined = undefined;
  if (context.segmentOverridePrefix !== undefined) {
    segmentOverridePrefix = context.segmentOverridePrefix;

    context.segmentOverridePrefix = undefined;
  }

  return {
    kind: 'mem',
    calculationKind: category.calculationKind,
    displacement,
    segmentOverridePrefix,
    length,
  };
}

function getAsTwosComplement(val: number, max: 127 | 32767): number {
  if (val <= max) {
    return val;
  } else {
    return val - 2 * (max + 1);
  }
}

function decodeDestDataForImmediateToAccumulatorInstruction(
  context: DecodingContext,
): [AccumulatorRegister, number] {
  const wBit = context.instructionBytes[context.index] & 0b0000_0001;

  const data = decodeIntLiteralData(context, wBit);

  const dest = wBit ? axReg : alReg;

  return [dest, data];
}

function decodeIntLiteralData(context: DecodingContext, wBit: number): number {
  if (wBit === 0) {
    context.index++;

    return context.instructionBytes[context.index];
  } else {
    context.index += 2;

    return (
      context.instructionBytes[context.index - 1] + (context.instructionBytes[context.index] << 8)
    );
  }
}

function consumeLockPrefix(context: DecodingContext, dest: RegisterOrEac): boolean {
  // I went off this random page, which is for ia-32
  // https://docs.oracle.com/cd/E19455-01/806-3773/instructionset-128/index.html
  // It says we can lock xchg, add, or, adc, sbb, and, sub, xor, not, neg, inc, dec
  // It also lists instructions that aren't on the 8086,
  // and seems to say we can only lock when dest is mem, except for xchg
  // TODO actually find this in the manual?
  if (dest.kind === 'reg' && context.lock) {
    throw Error('This instruction is not lockable');
  }

  const value = context.lock;

  context.lock = false;

  return value;
}

function consumeRepPrefix(context: DecodingContext): RepPrefix | null {
  const value = context.rep ?? null;

  context.rep = undefined;

  return value;
}
