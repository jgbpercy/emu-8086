// TODO: consolidate instructions into groups
// for normal mod/reg/rm instructions, type can be more restricted along these lines:

// type ModRegRmInstruction = {
//   readonly dest: RegisterOrEac;
//   readonly source: Register;
// } | {
//   readonly dest: Register;
//   readonly source: RegisterOrEac;
// }

// But is that actually helpful?

// TODO consolidate thrown Errors/Not Used/Unknown into coherent error handling that outputs what went wrong

export interface AddRegisterMemoryWithRegisterToEitherInstruction {
  readonly kind: 'addRegisterMemoryWithRegisterToEither';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
  readonly lock: boolean;
}

export interface AddImmediateToAccumulatorInstruction {
  readonly kind: 'addImmediateToAccumulator';
  readonly dest: AccumulatorRegister;
  readonly data: number;
}

export interface PushSegmentRegisterInstruction {
  readonly kind: 'pushSegmentRegister';
  readonly register: SegmentRegister;
}

export interface PopSegmentRegisterInstructions {
  readonly kind: 'popSegmentRegister';
  readonly register: Exclude<SegmentRegister, 'cs'>;
}

export interface OrRegisterMemoryAndRegisterToEitherInstruction {
  readonly kind: 'orRegisterMemoryAndRegisterToEither';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
  readonly lock: boolean;
}

export interface OrImmediateToAccumulatorInstruction {
  readonly kind: 'orImmediateToAccumulator';
  readonly dest: AccumulatorRegister;
  readonly data: number;
}

export interface AdcRegisterMemoryWithRegisterToEitherInstruction {
  readonly kind: 'adcRegisterMemoryWithRegisterToEither';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
  readonly lock: boolean;
}

export interface AdcImmediateToAccumulatorInstruction {
  readonly kind: 'adcImmediateToAccumulator';
  readonly dest: AccumulatorRegister;
  readonly data: number;
}

export interface SbbRegisterMemoryAndRegisterToEitherInstruction {
  readonly kind: 'sbbRegisterMemoryAndRegisterToEither';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
  readonly lock: boolean;
}

export interface SbbImmediateFromAccumulatorInstruction {
  readonly kind: 'sbbImmediateFromAccumulator';
  readonly dest: AccumulatorRegister;
  readonly data: number;
}

export interface AndRegisterMemoryWithRegisterToEitherInstruction {
  readonly kind: 'andRegisterMemoryWithRegisterToEither';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
  readonly lock: boolean;
}

export interface AndImmediateToAccumulatorInstruction {
  readonly kind: 'andImmediateToAccumulator';
  readonly dest: AccumulatorRegister;
  readonly data: number;
}

export interface DecimalAdjustForAddInstruction {
  readonly kind: 'decimalAdjustForAdd';
}

export interface SubRegisterMemoryAndRegisterToEitherInstruction {
  readonly kind: 'subRegisterMemoryAndRegisterToEither';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
  readonly lock: boolean;
}

export interface SubImmediateFromAccumulatorInstruction {
  readonly kind: 'subImmediateFromAccumulator';
  readonly dest: AccumulatorRegister;
  readonly data: number;
}

export interface DecimalAdjustForSubtractInstruction {
  readonly kind: 'decimalAdjustForSubtract';
}

export interface XorRegisterMemoryAndRegisterToEitherInstruction {
  readonly kind: 'xorRegisterMemoryAndRegisterToEither';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
  readonly lock: boolean;
}

export interface XorImmediateToAccumulatorInstruction {
  readonly kind: 'xorImmediateToAccumulator';
  readonly dest: AccumulatorRegister;
  readonly data: number;
}

export interface AsciiAdjustForAddInstruction {
  readonly kind: 'asciiAdjustForAdd';
}

export interface CmpRegisterMemoryAndRegisterInstruction {
  readonly kind: 'cmpRegisterMemoryAndRegister';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
}

export interface CmpImmediateWithAccumulatorInstruction {
  readonly kind: 'cmpImmediateWithAccumulator';
  readonly dest: AccumulatorRegister;
  readonly data: number;
}

export interface AsciiAdjustForSubtractInstruction {
  readonly kind: 'asciiAdjustForSubtract';
}

export interface IncRegisterInstruction {
  readonly kind: 'incRegister';
  readonly register: WordRegister;
}

export interface DecRegisterInstruction {
  readonly kind: 'decRegister';
  readonly register: WordRegister;
}

export interface PushRegisterInstruction {
  readonly kind: 'pushRegister';
  readonly register: WordRegister;
}

export interface PopRegisterInstruction {
  readonly kind: 'popRegister';
  readonly register: WordRegister;
}

export interface JumpOnOverflowInstruction {
  readonly kind: 'jumpOnOverflow';
  readonly signedIncrement: number;
}

export interface JumpOnNotOverflowInstruction {
  readonly kind: 'jumpOnNotOverflow';
  readonly signedIncrement: number;
}

export interface JumpOnBelowInstruction {
  readonly kind: 'jumpOnBelow';
  readonly signedIncrement: number;
}

export interface JumpOnNotBelowInstruction {
  readonly kind: 'jumpOnNotBelow';
  readonly signedIncrement: number;
}

export interface JumpOnEqualInstruction {
  readonly kind: 'jumpOnEqual';
  readonly signedIncrement: number;
}

export interface JumpOnNotEqualInstruction {
  readonly kind: 'jumpOnNotEqual';
  readonly signedIncrement: number;
}

export interface JumpOnNotAboveInstruction {
  readonly kind: 'jumpOnNotAbove';
  readonly signedIncrement: number;
}

export interface JumpOnAboveInstruction {
  readonly kind: 'jumpOnAbove';
  readonly signedIncrement: number;
}

export interface JumpOnSignInstruction {
  readonly kind: 'jumpOnSign';
  readonly signedIncrement: number;
}

export interface JumpOnNotSignInstruction {
  readonly kind: 'jumpOnNotSign';
  readonly signedIncrement: number;
}

export interface JumpOnParityInstruction {
  readonly kind: 'jumpOnParity';
  readonly signedIncrement: number;
}

export interface JumpOnNotParityInstruction {
  readonly kind: 'jumpOnNotParity';
  readonly signedIncrement: number;
}

export interface JumpOnLessInstruction {
  readonly kind: 'jumpOnLess';
  readonly signedIncrement: number;
}

export interface JumpOnNotLessInstruction {
  readonly kind: 'jumpOnNotLess';
  readonly signedIncrement: number;
}

export interface JumpOnNotGreaterInstruction {
  readonly kind: 'jumpOnNotGreater';
  readonly signedIncrement: number;
}

export interface JumpOnGreaterInstruction {
  readonly kind: 'jumpOnGreater';
  readonly signedIncrement: number;
}

export interface AddImmediateToRegisterMemoryInstruction {
  readonly kind: 'addImmediateToRegisterMemory';
  readonly dest: RegisterOrEac;
  readonly data: number;
  readonly lock: boolean;
}

export interface OrImmediateToRegisterMemoryInstruction {
  readonly kind: 'orImmediateToRegisterMemory';
  readonly dest: RegisterOrEac;
  readonly data: number;
  readonly lock: boolean;
}

export interface AdcImmediateToRegisterMemoryInstruction {
  readonly kind: 'adcImmediateToRegisterMemory';
  readonly dest: RegisterOrEac;
  readonly data: number;
  readonly lock: boolean;
}

export interface SbbImmediateToRegisterMemoryInstruction {
  readonly kind: 'sbbImmediateToRegisterMemory';
  readonly dest: RegisterOrEac;
  readonly data: number;
  readonly lock: boolean;
}

export interface AndImmediateToRegisterMemoryInstruction {
  readonly kind: 'andImmediateToRegisterMemory';
  readonly dest: RegisterOrEac;
  readonly data: number;
  readonly lock: boolean;
}

export interface SubImmediateToRegisterMemoryInstruction {
  readonly kind: 'subImmediateToRegisterMemory';
  readonly dest: RegisterOrEac;
  readonly data: number;
  readonly lock: boolean;
}

export interface XorImmediateToRegisterMemoryInstruction {
  readonly kind: 'xorImmediateToRegisterMemory';
  readonly dest: RegisterOrEac;
  readonly data: number;
  readonly lock: boolean;
}

export interface CmpImmediateToRegisterMemoryInstruction {
  readonly kind: 'cmpImmediateToRegisterMemory';
  readonly dest: RegisterOrEac;
  readonly data: number;
}

export interface TestRegisterMemoryAndRegisterInstruction {
  readonly kind: 'testRegisterMemoryAndRegister';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
}

export interface XchgRegisterMemoryWithRegisterInstruction {
  readonly kind: 'xchgRegisterMemoryWithRegister';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
  readonly lock: boolean;
}

export interface MovRegisterMemoryToFromRegisterInstruction {
  readonly kind: 'movRegisterMemoryToFromRegister';
  readonly dest: RegisterOrEac;
  readonly source: RegisterOrEac;
}

export interface MovSegmentRegisterToRegisterMemoryInstruction {
  readonly kind: 'movSegmentRegisterToRegisterMemory';
  readonly dest: RegisterOrEac;
  readonly source: SegmentRegister;
}

export interface LeaLoadEaToRegisterInstruction {
  readonly kind: 'leaLoadEaToRegister';
  readonly dest: Register;
  readonly source: EffectiveAddressCalculation;
}

export interface MovRegisterMemoryToSegmentRegisterInstruction {
  readonly kind: 'movRegisterMemoryToSegmentRegister';
  readonly dest: SegmentRegister;
  readonly source: RegisterOrEac;
}

export interface PopRegisterMemoryInstruction {
  readonly kind: 'popRegisterMemory';
  readonly dest: RegisterOrEac;
}

export interface XchgRegisterWithAccumulatorInstruction {
  readonly kind: 'xchgRegisterWithAccumulator';
  readonly source: WordRegister;
}

export interface CbwConvertByteToWordInstruction {
  readonly kind: 'cbwConvertByteToWord';
}

export interface CwdConvertWordToDoubleWordInstruction {
  readonly kind: 'cwdConvertWordToDoubleWord';
}

export interface CallDirectIntersegmentInstruction {
  readonly kind: 'callDirectIntersegment';
  readonly ip: number;
  readonly cs: number;
}

export interface WaitInstruction {
  readonly kind: 'wait';
}

export interface PushfPushFlagsInstruction {
  readonly kind: 'pushfPushFlags';
}

export interface PopfPopFlagsInstruction {
  readonly kind: 'popfPopFlags';
}

export interface SahfStoreAhIntoFlagsInstruction {
  readonly kind: 'sahfStoreAhIntoFlags';
}

export interface LahfLoadAhWithFlagsInstruction {
  readonly kind: 'lahfLoadAhWithFlags';
}

export interface MovMemoryToFromAccumulatorInstruction {
  readonly kind: 'movMemoryToFromAccumulator';
  readonly dest:
    | AccumulatorRegister
    | { kind: 'mem'; text: 'DIRECT ADDRESS'; displacement: number };
  readonly source:
    | AccumulatorRegister
    | { kind: 'mem'; text: 'DIRECT ADDRESS'; displacement: number };
}

export interface MovsInstruction {
  readonly kind: 'movs';
  readonly word: boolean;
}

export interface CmpsInstruction {
  readonly kind: 'cmps';
  readonly word: boolean;
}

export interface TestImmediateWithAccumulatorInstruction {
  readonly kind: 'testImmediateWithAccumulator';
  readonly dest: AccumulatorRegister;
  readonly data: number;
}

export interface StosInstruction {
  readonly kind: 'stos';
  readonly word: boolean;
}

export interface LodsInstruction {
  readonly kind: 'lods';
  readonly word: boolean;
}

export interface ScasInstruction {
  readonly kind: 'scas';
  readonly word: boolean;
}

export interface MovImmediateToRegisterInstruction {
  readonly kind: 'movImmediateToRegister';
  readonly dest: Register;
  readonly data: number;
}

export interface RetWithinSegAddingImmedToSpInstruction {
  readonly kind: 'retWithinSegAddingImmedToSp';
  readonly data: number;
}

export interface RetWithinSegmentInstruction {
  readonly kind: 'retWithinSegment';
}

export interface LesLoadPointerToEsInstruction {
  readonly kind: 'lesLoadPointerToEs';
  readonly dest: WordRegister;
  readonly source: EffectiveAddressCalculation;
}

export interface LdsLoadPointerToDsInstruction {
  readonly kind: 'ldsLoadPointerToDs';
  readonly dest: WordRegister;
  readonly source: EffectiveAddressCalculation;
}

export interface MovImmediateToRegisterMemoryInstruction {
  readonly kind: 'movImmediateToRegisterMemory';
  readonly dest: RegisterOrEac;
  readonly data: number;
}

export interface RetIntersegmentAddingImmediateToSpInstruction {
  readonly kind: 'retIntersegmentAddingImmediateToSp';
  readonly data: number;
}

export interface RetIntersegmentInstruction {
  readonly kind: 'retIntersegment';
}

export interface IntType3Instruction {
  readonly kind: 'intType3';
}

export interface IntTypeSpecifiedInstruction {
  readonly kind: 'intTypeSpecified';
  readonly data: number;
}

export interface IntoInterruptOnOverflowInstruction {
  readonly kind: 'intoInterruptOnOverflow';
}

export interface IretInterruptReturnInstruction {
  readonly kind: 'iretInterruptReturn';
}

export interface RolRotateLeftInstruction {
  readonly kind: 'rolRotateLeft';
  readonly dest: RegisterOrEac;
  readonly source: 1 | typeof clReg;
}

export interface RorRotateRightInstruction {
  readonly kind: 'rorRotateRight';
  readonly dest: RegisterOrEac;
  readonly source: 1 | typeof clReg;
}

export interface RclRotateThroughCarryFlagLeftInstruction {
  readonly kind: 'rclRotateThroughCarryFlagLeft';
  readonly dest: RegisterOrEac;
  readonly source: 1 | typeof clReg;
}

export interface RcrRotateThroughCarryRightInstruction {
  readonly kind: 'rcrRotateThroughCarryRight';
  readonly dest: RegisterOrEac;
  readonly source: 1 | typeof clReg;
}

export interface SalShiftLogicalArithmeticLeftInstruction {
  readonly kind: 'salShiftLogicalArithmeticLeft';
  readonly dest: RegisterOrEac;
  readonly source: 1 | typeof clReg;
}

export interface ShrShiftLogicalRightInstruction {
  readonly kind: 'shrShiftLogicalRight';
  readonly dest: RegisterOrEac;
  readonly source: 1 | typeof clReg;
}

export interface SarShiftArithmeticRightInstruction {
  readonly kind: 'sarShiftArithmeticRight';
  readonly dest: RegisterOrEac;
  readonly source: 1 | typeof clReg;
}

export interface AamAsciiAdjustForMultipleInstruction {
  readonly kind: 'aamAsciiAdjustForMultiply';
}

export interface AadAsciiAdjustForDivideInstruction {
  readonly kind: 'aadAsciiAdjustForDivide';
}

export interface XlatTranslateByteToAlInstruction {
  readonly kind: 'xlatTranslateByteToAl';
}

export interface EscEscapeToExternalDeviceInstruction {
  readonly kind: 'escEscapeToExternalDevice';
  readonly source: RegisterOrEac;
  readonly data: number;
}

export interface LoopneLoopWhileNotEqualInstruction {
  readonly kind: 'loopneLoopWhileNotEqual';
  readonly signedIncrement: number;
}

export interface LoopeLoopWhileEqualInstruction {
  readonly kind: 'loopeLoopWhileEqual';
  readonly signedIncrement: number;
}

export interface LoopLoopCxTimesInstruction {
  readonly kind: 'loopLoopCxTimes';
  readonly signedIncrement: number;
}

export interface JcxzJumpOnCxZeroInstruction {
  readonly kind: 'jcxzJumpOnCxZero';
  readonly signedIncrement: number;
}

export interface InFixedPortInstruction {
  readonly kind: 'inFixedPort';
  readonly dest: AccumulatorRegister;
  readonly data: number;
}

export interface OutFixedPortInstruction {
  readonly kind: 'outFixedPort';
  readonly dest: AccumulatorRegister;
  readonly data: number;
}

export interface CallDirectWithinSegmentInstruction {
  readonly kind: 'callDirectWithinSegment';
  readonly ip: number;
}

export interface JmpDirectWithinSegmentInstruction {
  readonly kind: 'jmpDirectWithinSegment';
  readonly ip: number;
}

export interface JmpDirectIntersegmentInstruction {
  readonly kind: 'jmpDirectIntersegment';
  readonly ip: number;
  readonly cs: number;
}

export interface JmpDirectWithinSegmentShortInstruction {
  readonly kind: 'jmpDirectWithinSegmentShort';
  readonly ip: number;
}

export interface InVariablePortInstruction {
  readonly kind: 'inVariablePort';
  readonly dest: AccumulatorRegister;
}

export interface OutVariablePortInstruction {
  readonly kind: 'outVariablePortInstruction';
  readonly dest: AccumulatorRegister;
}

export interface UnknownInstruction {
  readonly kind: 'UNKNOWN';
}

export interface NotUsedInstruction {
  readonly kind: 'NOT USED';
  readonly byte: number;
}

type ShortLabelJumpInstruction =
  | JumpOnOverflowInstruction
  | JumpOnNotOverflowInstruction
  | JumpOnBelowInstruction
  | JumpOnNotBelowInstruction
  | JumpOnEqualInstruction
  | JumpOnNotEqualInstruction
  | JumpOnNotAboveInstruction
  | JumpOnAboveInstruction
  | JumpOnSignInstruction
  | JumpOnNotSignInstruction
  | JumpOnParityInstruction
  | JumpOnNotParityInstruction
  | JumpOnLessInstruction
  | JumpOnNotLessInstruction
  | JumpOnNotGreaterInstruction
  | JumpOnGreaterInstruction;

type StandardArithmeticLogicImmediateToRegisterMemoryInstruction =
  | AddImmediateToRegisterMemoryInstruction
  | OrImmediateToRegisterMemoryInstruction
  | AdcImmediateToRegisterMemoryInstruction
  | SbbImmediateToRegisterMemoryInstruction
  | AndImmediateToRegisterMemoryInstruction
  | SubImmediateToRegisterMemoryInstruction
  | XorImmediateToRegisterMemoryInstruction
  | CmpImmediateToRegisterMemoryInstruction;

type StandardLogicWithOneOrClInstruction =
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

export type DecodedInstruction =
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
  | DecimalAdjustForAddInstruction
  | SubRegisterMemoryAndRegisterToEitherInstruction
  | SubImmediateFromAccumulatorInstruction
  | DecimalAdjustForSubtractInstruction
  | XorRegisterMemoryAndRegisterToEitherInstruction
  | XorImmediateToAccumulatorInstruction
  | AsciiAdjustForAddInstruction
  | CmpRegisterMemoryAndRegisterInstruction
  | CmpImmediateWithAccumulatorInstruction
  | AsciiAdjustForSubtractInstruction
  | IncRegisterInstruction
  | DecRegisterInstruction
  | PushRegisterInstruction
  | PopRegisterInstruction
  | ShortLabelJumpInstruction
  | StandardArithmeticLogicImmediateToRegisterMemoryInstruction
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
  | MovMemoryToFromAccumulatorInstruction
  | MovsInstruction
  | CmpsInstruction
  | TestImmediateWithAccumulatorInstruction
  | StosInstruction
  | LodsInstruction
  | ScasInstruction
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
  | StandardLogicWithOneOrClInstruction
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
  | NotUsedInstruction
  | UnknownInstruction;

type _Register =
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

interface Register {
  kind: 'reg';
  register: _Register;
}

type AccumulatorRegister = typeof alReg | typeof axReg;

type WordRegister =
  | typeof axReg
  | typeof bxReg
  | typeof cxReg
  | typeof dxReg
  | typeof spReg
  | typeof bpReg
  | typeof siReg
  | typeof diReg;

type _EffectiveAddressCalculationCategory =
  | { kind: 'eac'; text: 'bx + si'; displacementBytes: 0 | 1 | 2 }
  | { kind: 'eac'; text: 'bx + di'; displacementBytes: 0 | 1 | 2 }
  | { kind: 'eac'; text: 'bp + si'; displacementBytes: 0 | 1 | 2 }
  | { kind: 'eac'; text: 'bp + di'; displacementBytes: 0 | 1 | 2 }
  | { kind: 'eac'; text: 'si'; displacementBytes: 0 | 1 | 2 }
  | { kind: 'eac'; text: 'di'; displacementBytes: 0 | 1 | 2 }
  | { kind: 'eac'; text: 'DIRECT ADDRESS'; displacementBytes: 2 }
  | { kind: 'eac'; text: 'bx'; displacementBytes: 0 | 1 | 2 }
  | { kind: 'eac'; text: 'bp'; displacementBytes: 1 | 2 };

type EffectiveAddressCalculationCategory = { kind: 'eac' } & _EffectiveAddressCalculationCategory;

type SegmentRegister = 'es' | 'cs' | 'ss' | 'ds';

export type RegisterOrEacCategory = Register | EffectiveAddressCalculationCategory;

export interface EffectiveAddressCalculation {
  readonly kind: 'mem';
  readonly text: EffectiveAddressCalculationCategory['text'];
  readonly displacement: number | null;
  readonly segmentOverridePrefix?: SegmentRegister;
}

export type RegisterOrEac = Register | EffectiveAddressCalculation;

const alReg = { kind: 'reg', register: 'al' } as const;
const axReg = { kind: 'reg', register: 'ax' } as const;
const clReg = { kind: 'reg', register: 'cl' } as const;
const cxReg = { kind: 'reg', register: 'cx' } as const;
const dlReg = { kind: 'reg', register: 'dl' } as const;
const dxReg = { kind: 'reg', register: 'dx' } as const;
const blReg = { kind: 'reg', register: 'bl' } as const;
const bxReg = { kind: 'reg', register: 'bx' } as const;
const ahReg = { kind: 'reg', register: 'ah' } as const;
const spReg = { kind: 'reg', register: 'sp' } as const;
const chReg = { kind: 'reg', register: 'ch' } as const;
const bpReg = { kind: 'reg', register: 'bp' } as const;
const dhReg = { kind: 'reg', register: 'dh' } as const;
const siReg = { kind: 'reg', register: 'si' } as const;
const bhReg = { kind: 'reg', register: 'bh' } as const;
const diReg = { kind: 'reg', register: 'di' } as const;

// table 4-9
const regTable: ReadonlyArray<Register> = [
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

const wordRegisterTable: ReadonlyArray<WordRegister> = [
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

// table 4-10
const effectiveAddressTable: Readonly<Record<number, EffectiveAddressCalculationCategory>> = {
  // mod 00, rm 000
  [0b0000_0000]: { kind: 'eac', text: 'bx + si', displacementBytes: 0 },
  // mod 00, rm 001
  [0b0000_0001]: { kind: 'eac', text: 'bx + di', displacementBytes: 0 },
  // mod 00, rm 010
  [0b0000_0010]: { kind: 'eac', text: 'bp + si', displacementBytes: 0 },
  // mod 00, rm 011
  [0b0000_0011]: { kind: 'eac', text: 'bp + di', displacementBytes: 0 },
  // mod 00, rm 100
  [0b0000_0100]: { kind: 'eac', text: 'si', displacementBytes: 0 },
  // mod 00, rm 101
  [0b0000_0101]: { kind: 'eac', text: 'di', displacementBytes: 0 },
  // mod 00, rm 110
  [0b0000_0110]: { kind: 'eac', text: 'DIRECT ADDRESS', displacementBytes: 2 },
  // mod 00, rm 111
  [0b0000_0111]: { kind: 'eac', text: 'bx', displacementBytes: 0 },
  // mod 01, rm 000
  [0b0100_0000]: { kind: 'eac', text: 'bx + si', displacementBytes: 1 },
  // mod 01, rm 001
  [0b0100_0001]: { kind: 'eac', text: 'bx + di', displacementBytes: 1 },
  // mod 01, rm 010
  [0b0100_0010]: { kind: 'eac', text: 'bp + si', displacementBytes: 1 },
  // mod 01, rm 011
  [0b0100_0011]: { kind: 'eac', text: 'bp + di', displacementBytes: 1 },
  // mod 01, rm 100
  [0b0100_0100]: { kind: 'eac', text: 'si', displacementBytes: 1 },
  // mod 01, rm 101
  [0b0100_0101]: { kind: 'eac', text: 'di', displacementBytes: 1 },
  // mod 01, rm 110
  [0b0100_0110]: { kind: 'eac', text: 'bp', displacementBytes: 1 },
  // mod 01, rm 111
  [0b0100_0111]: { kind: 'eac', text: 'bx', displacementBytes: 1 },
  // mod 10, rm 000
  [0b1000_0000]: { kind: 'eac', text: 'bx + si', displacementBytes: 2 },
  // mod 10, rm 001
  [0b1000_0001]: { kind: 'eac', text: 'bx + di', displacementBytes: 2 },
  // mod 10, rm 010
  [0b1000_0010]: { kind: 'eac', text: 'bp + si', displacementBytes: 2 },
  // mod 10, rm 011
  [0b1000_0011]: { kind: 'eac', text: 'bp + di', displacementBytes: 2 },
  // mod 10, rm 100
  [0b1000_0100]: { kind: 'eac', text: 'si', displacementBytes: 2 },
  // mod 10, rm 101
  [0b1000_0101]: { kind: 'eac', text: 'di', displacementBytes: 2 },
  // mod 10, rm 110
  [0b1000_0110]: { kind: 'eac', text: 'bp', displacementBytes: 2 },
  // mod 10, rm 111
  [0b1000_0111]: { kind: 'eac', text: 'bx', displacementBytes: 2 },
};

// 70 - 7f in table 4-13
const shortLabelJumpInstructionTable: ReadonlyArray<ShortLabelJumpInstruction['kind']> = [
  // 0000
  'jumpOnOverflow',
  // 0001
  'jumpOnNotOverflow',
  // 0010
  'jumpOnBelow',
  // 0011
  'jumpOnNotBelow',
  // 0100
  'jumpOnEqual',
  // 0101
  'jumpOnNotEqual',
  // 0110
  'jumpOnNotAbove',
  // 0111
  'jumpOnAbove',
  // 1000
  'jumpOnSign',
  // 1001
  'jumpOnNotSign',
  // 1010
  'jumpOnParity',
  // 1011
  'jumpOnNotParity',
  // 1100
  'jumpOnLess',
  // 1101
  'jumpOnNotLess',
  // 1110
  'jumpOnNotGreater',
  // 1111
  'jumpOnGreater',
];

const standardArithmeticLogicImmediateToRegisterMemoryInstructionTable: ReadonlyArray<
  StandardArithmeticLogicImmediateToRegisterMemoryInstruction['kind']
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

const segmentRegisterTable: ReadonlyArray<SegmentRegister> = [
  // 00
  'es',
  // 01
  'cs',
  // 10
  'ss',
  // 11
  'ds',
];

const standardLogicWithOneOrClInstructionTable: ReadonlyArray<
  StandardLogicWithOneOrClInstruction['kind'] | NotUsedInstruction['kind']
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

class DecodingContext {
  index = 0;

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

  constructor(public readonly instructionBytes: InstructionBytes) {}
}

type InstructionBytes = Uint8Array;

export function decodeInstructions(
  instructionBytes: InstructionBytes,
): ReadonlyArray<DecodedInstruction> {
  const instructions: DecodedInstruction[] = [];

  const context = new DecodingContext(instructionBytes);

  while (context.index < instructionBytes.length) {
    console.log(context.index);
    instructions.push(decodeInstruction(context));
  }

  return instructions;
}

export type DecodedInstructionWithByteIndex = [number, DecodedInstruction];

export function decodeInstructionsAndByteIndices(
  instructionBytes: InstructionBytes,
): ReadonlyArray<DecodedInstructionWithByteIndex> {
  const instructions: DecodedInstructionWithByteIndex[] = [];

  const context = new DecodingContext(instructionBytes);

  while (context.index < instructionBytes.length) {
    instructions.push([context.index, decodeInstruction(context)]);
  }

  return instructions;
}

function consumeLockPrefix(context: DecodingContext, dest: RegisterOrEac): boolean {
  // I went off this random page, which is for ia-32
  // It says we can lock xchg, add, or, adc, sbb, and, sub, xor, not, neg, inc, dec
  // It also lists instructions that aren't on the 8086,
  // and seems to say we can only lock when dest is mem, except for xchg
  // TODO actually find this in the
  if (dest.kind === 'reg' && context.lock) {
    throw Error('This instruction is not lockable');
  }

  const value = context.lock;

  context.lock = false;

  return value;
}

function decodeInstruction(context: DecodingContext): DecodedInstruction {
  const firstByte = context.instructionBytes[context.index];

  let instruction: DecodedInstruction;

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
        dest,
        source,
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
        dest,
        data,
      };

      break;
    }

    // 06
    // push Segment register es
    case 0b0000_0110: {
      instruction = {
        kind: 'pushSegmentRegister',
        register: 'es',
      };

      break;
    }

    // 07
    // pop Segment register es
    case 0b0000_0111: {
      instruction = {
        kind: 'popSegmentRegister',
        register: 'es',
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
        dest,
        source,
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
        dest,
        data,
      };

      break;
    }

    // 0e
    // push Segment register cs
    case 0b0000_1110: {
      instruction = {
        kind: 'pushSegmentRegister',
        register: 'cs',
      };

      break;
    }

    // 0f
    // NOT USED - apparently popping cs isn't a thing
    case 0b0000_1111: {
      instruction = {
        kind: 'NOT USED',
        byte: firstByte,
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
        dest,
        source,
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
        dest,
        data,
      };

      break;
    }

    // 16
    // push Segment register ss
    case 0b0001_0110: {
      instruction = {
        kind: 'pushSegmentRegister',
        register: 'ss',
      };

      break;
    }

    // 17
    // pop Segment register SS
    case 0b0001_0111: {
      instruction = {
        kind: 'popSegmentRegister',
        register: 'ss',
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
        dest,
        source,
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
        dest,
        data,
      };

      break;
    }

    // 1e
    // push Segment register ds
    case 0b0001_1110: {
      instruction = {
        kind: 'pushSegmentRegister',
        register: 'ds',
      };

      break;
    }

    // 1f
    // pop Segment register ds
    case 0b0001_1111: {
      instruction = {
        kind: 'popSegmentRegister',
        register: 'ds',
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
        dest,
        source,
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
        dest,
        data,
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
        kind: 'decimalAdjustForAdd',
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
        dest,
        source,
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
        dest,
        data,
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
        kind: 'decimalAdjustForSubtract',
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
        dest,
        source,
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
        dest,
        data,
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
        kind: 'asciiAdjustForAdd',
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
        dest,
        source,
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
        dest,
        data,
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
        kind: 'asciiAdjustForSubtract',
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
      const register = wordRegisterTable[firstByte & 0b0000_0111];

      instruction = {
        kind: 'incRegister',
        register,
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
      const register = wordRegisterTable[firstByte & 0b0000_0111];

      instruction = {
        kind: 'decRegister',
        register,
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
      const register = wordRegisterTable[firstByte & 0b0000_0111];

      instruction = {
        kind: 'pushRegister',
        register,
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
      const register = wordRegisterTable[firstByte & 0b0000_0111];

      instruction = {
        kind: 'popRegister',
        register,
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
      instruction = { kind: 'NOT USED', byte: firstByte };

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
        signedIncrement: getAsTwosComplement(context.instructionBytes[context.index], 128),
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

      if (
        sBit &&
        (instructionKind === 'orImmediateToRegisterMemory' ||
          instructionKind === 'andImmediateToRegisterMemory' ||
          instructionKind === 'xorImmediateToRegisterMemory')
      ) {
        instruction = { kind: 'UNKNOWN' };
        break;
      }

      const dest = decodeRegisterOrEffectiveAddressCalculation(context, destRm);

      const wBitForDataDecode = wBit && !sBit ? 1 : 0;

      let data = decodeIntLiteralData(context, wBitForDataDecode);

      if (sBit) {
        data = getAsTwosComplement(data, 128);
      }

      instruction = {
        kind: instructionKind,
        dest,
        data,
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

      instruction = {
        kind: 'testRegisterMemoryAndRegister',
        dest,
        source,
      };

      break;
    }

    // 86 = 87
    // xchg Register/memory with register
    // Layout 1000 011w
    case 0b1000_0110:
    case 0b1000_0111: {
      const [dest, source] = decodeDestSourceForModRegRmInstruction(context);

      // Don't use consumeLockPrefix, as we can lock even if source is mem (I think)
      const lock = context.lock;

      context.lock = false;

      instruction = {
        kind: 'xchgRegisterMemoryWithRegister',
        dest,
        source,
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
        dest,
        source,
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

      const source = segmentRegisterTable[srBits >> 3];

      const dest = decodeRegisterOrEffectiveAddressCalculation(context, destRm);

      instruction = {
        kind: 'movSegmentRegisterToRegisterMemory',
        dest,
        source,
      };

      break;
    }

    // 8d
    // lea Load EA to register
    case 0b1000_1101: {
      const [dest, sourceCategory] = decodeModRegRm(context, 1);

      if (sourceCategory.kind === 'reg') {
        throw Error(
          "Got mov register source for lea instruction. Seems like this shouldn't be possible",
        );
      }

      const source = decodeEffectiveAddressCalculation(context, sourceCategory);

      instruction = {
        kind: 'leaLoadEaToRegister',
        dest,
        source,
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

      const dest = segmentRegisterTable[srBits >> 3];

      const source = decodeRegisterOrEffectiveAddressCalculation(context, sourceRm);

      instruction = {
        kind: 'movRegisterMemoryToSegmentRegister',
        dest,
        source,
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

      const dest = decodeRegisterOrEffectiveAddressCalculation(context, destRm);

      instruction = {
        kind: 'popRegisterMemory',
        dest,
      };

      break;
    }

    // 90
    // nop (exchange AX, AX)
    // Casey's listing doesn't have this so I guess it's effectively no used, but TODO try getting nasm to assemble it
    case 0b1001_0000: {
      instruction = {
        kind: 'NOT USED',
        byte: firstByte,
      };

      break;
    }

    // 91 - 97
    // xchg Register with accumulator
    // Layout 1001 0rrr    (r = word register)
    case 0b1001_0001:
    case 0b1001_0010:
    case 0b1001_0011:
    case 0b1001_0100:
    case 0b1001_0101:
    case 0b1001_0110:
    case 0b1001_0111: {
      const source = wordRegisterTable[firstByte & 0b0000_0111];

      instruction = {
        kind: 'xchgRegisterWithAccumulator',
        source,
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
        ip,
        cs,
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
        text: 'DIRECT ADDRESS',
        displacement,
      } satisfies EffectiveAddressCalculation;

      instruction = {
        kind: 'movMemoryToFromAccumulator',
        dest: isAccToMem ? memoryAddressCalculation : reg,
        source: isAccToMem ? reg : memoryAddressCalculation,
      };

      break;
    }

    // a4 - a5
    // movs Move byte/word
    case 0b1010_0100:
    case 0b1010_0101: {
      instruction = {
        kind: 'movs',
        word: !!(firstByte & 0b0000_0001),
      };

      break;
    }

    // a6 - a7
    // cmps Compare byte/word
    case 0b1010_0110:
    case 0b1010_0111: {
      instruction = {
        kind: 'cmps',
        word: !!(firstByte & 0b0000_0001),
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

        dest,
        data,
      };

      break;
    }

    // aa - ab
    // stos Store byte/word from AL/AX
    case 0b1010_1010:
    case 0b1010_1011: {
      instruction = {
        kind: 'stos',
        word: !!(firstByte & 0b0000_0001),
      };

      break;
    }

    // ac - ad
    // lods
    case 0b1010_1100:
    case 0b1010_1101: {
      instruction = {
        kind: 'lods',
        word: !!(firstByte & 0b0000_0001),
      };

      break;
    }

    // ae - af
    // scas
    case 0b1010_1110:
    case 0b1010_1111: {
      instruction = {
        kind: 'scas',
        word: !!(firstByte & 0b0000_0001),
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
      const dest = regTable[((firstByte & 0b0000_0111) << 1) | wBit];

      const data = decodeIntLiteralData(context, wBit);

      instruction = {
        kind: 'movImmediateToRegister',
        dest,
        data,
      };

      break;
    }

    // c0 - c1
    // NOT USED
    case 0b1100_0000:
    case 0b1100_0001: {
      instruction = {
        kind: 'NOT USED',
        byte: firstByte,
      };

      break;
    }

    // c2
    // ret Within seg adding immed to SP
    case 0b1100_0010: {
      const data = decodeIntLiteralData(context, 1);

      instruction = {
        kind: 'retWithinSegAddingImmedToSp',
        data,
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

      const dest = wordRegisterTable[regBits >> 3];

      const source = decodeEffectiveAddressCalculation(context, sourceEacCategory);

      instruction = {
        kind: 0b0000_0001 & firstByte ? 'ldsLoadPointerToDs' : 'lesLoadPointerToEs',
        dest,
        source,
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

      if (reg.register !== 'al' && reg.register !== 'ax') {
        throw new Error(
          'Encounted immediate move to register memory with non-000 reg in mod reg r/m byte. See table 4-13 C6/C7',
        );
      }

      const dest = decodeRegisterOrEffectiveAddressCalculation(context, destRm);

      const data = decodeIntLiteralData(context, wBit);

      instruction = { kind: 'movImmediateToRegisterMemory', dest, data };

      break;
    }

    // c8 - c9
    // NOT USED
    case 0b1100_1000:
    case 0b1100_1001: {
      instruction = {
        kind: 'NOT USED',
        byte: firstByte,
      };

      break;
    }

    // ca
    // ret Intersegment adding immediate to SP
    case 0b1100_1010: {
      const data = decodeIntLiteralData(context, 1);

      instruction = {
        kind: 'retIntersegmentAddingImmediateToSp',
        data,
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
        data,
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

      const dest = decodeRegisterOrEffectiveAddressCalculation(context, destRm);

      const source: StandardLogicWithOneOrClInstruction['source'] = vBit ? clReg : 1;

      const _instruction: StandardLogicWithOneOrClInstruction = {
        kind: instructionKind,
        dest,
        source,
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
        byte: firstByte,
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

      const source = decodeRegisterOrEffectiveAddressCalculation(context, sourceRm);

      instruction = {
        kind: 'escEscapeToExternalDevice',
        source,
        data: fullOpCode,
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
        signedIncrement: getAsTwosComplement(context.instructionBytes[context.index], 128),
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

      const dest = wBit ? axReg : alReg;

      const data = decodeIntLiteralData(context, 0);

      instruction = {
        kind: instructionKind,
        dest,
        data,
      };

      break;
    }

    // e8
    // call Direct within segment
    case 0b1110_1000: {
      const ip = decodeIntLiteralData(context, 1);

      instruction = {
        kind: 'callDirectWithinSegment',
        ip,
      };

      break;
    }

    // e9
    // jmp Direct within segment
    case 0b1110_1001: {
      const ip = decodeIntLiteralData(context, 1);

      instruction = {
        kind: 'jmpDirectWithinSegment',
        ip,
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
        ip,
        cs,
      };

      break;
    }

    // eb
    // jmp Direct within segment short
    case 0b1110_1011: {
      const ip = decodeIntLiteralData(context, 0);

      instruction = {
        kind: 'jmpDirectWithinSegmentShort',
        ip,
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
        ? 'outVariablePortInstruction'
        : 'inVariablePort';

      const dest = wBit ? axReg : alReg;

      instruction = {
        kind: instructionKind,
        dest,
      };

      break;
    }

    // f0

    default:
      instruction = { kind: 'UNKNOWN' };
  }

  context.index++;

  // If we got here without consuming the segment register prefix, something went very wrong!
  if (context.segmentOverridePrefix !== undefined) {
    throw Error('Unconsumed segment register prefix');
  }

  return instruction;
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

    dest = decodeEffectiveAddressCalculation(context, destRm);
  } else if (sourceRm.kind === 'eac') {
    dest = destRm;

    source = decodeEffectiveAddressCalculation(context, sourceRm);
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
  const reg = regTable[regTableLookup];

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
    const rmReg = regTable[((byte & 0b0000_0111) << 1) | wBit];

    return [middleThreeBits, rmReg];
  } else {
    // If mod is memory mode (i.e. no register-to-register), use the relevant bits (mod and rm) on the effective address table (4-10)
    const rmEac = effectiveAddressTable[byte & 0b1100_0111];

    return [middleThreeBits, rmEac];
  }
}

function assertIsRegister(rm: RegisterOrEacCategory): asserts rm is Register {
  if (rm.kind === 'eac') {
    throw new Error(`Expected register, got ${rm.kind} ${rm.text}`);
  }
}

function decodeRegisterOrEffectiveAddressCalculation(
  context: DecodingContext,
  registerOrEacCategory: RegisterOrEacCategory,
): RegisterOrEac {
  if (registerOrEacCategory.kind === 'reg') {
    return registerOrEacCategory;
  } else {
    return decodeEffectiveAddressCalculation(context, registerOrEacCategory);
  }
}

// possibleDisplacementBytes could possible be undefined if we're reading the last instruction.
// But in a valid instruction stream we should never have displacement that reads into those bytes, obv
function decodeEffectiveAddressCalculation(
  context: DecodingContext,
  category: EffectiveAddressCalculationCategory,
): EffectiveAddressCalculation {
  let displacement: number | null;

  if (category.displacementBytes === 0) {
    displacement = null;
  } else if (category.displacementBytes === 1) {
    displacement = getAsTwosComplement(context.instructionBytes[context.index + 1], 128);
  } else {
    displacement = getAsTwosComplement(
      context.instructionBytes[context.index + 1] +
        (context.instructionBytes[context.index + 2] << 8),
      32768,
    );
  }

  context.index += category.displacementBytes;

  let segmentOverridePrefix: SegmentRegister | undefined = undefined;
  if (context.segmentOverridePrefix !== undefined) {
    segmentOverridePrefix = context.segmentOverridePrefix;

    context.segmentOverridePrefix = undefined;
  }

  return { kind: 'mem', text: category.text, displacement, segmentOverridePrefix };
}

function getAsTwosComplement(val: number, max: 128 | 32768): number {
  if (val < max) {
    return val;
  } else {
    return -2 * max + val;
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
