import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { map } from 'rxjs';
import {
  AnnotatedInstructionComponent,
  AnnotatedInstructionData,
} from './annotated-instruction.component';
import { printDecodedInstruction } from './decoded-instruction-printer';
import { decodeInstructions } from './decoder';
import { encodeBitAnnotations } from './encoder';
import { FlagPipe } from './flag.pipe';
import { Memory, total8086MemorySizeInBytes } from './memory';
import { NumPipe, printNum } from './num.pipe';
import { SimulatedInstructionComponent } from './simulated-instruction.component';
import { SimulatedInstruction, caseyPrint } from './simulation-printer';
import { SimulationState, simulateInstruction } from './simulator';
import { valueChangesWithInitial } from './value-changes-with-initial';

/* TODO:
 *
 * Features:
 * - Simulate all instructions
 * - asm parser and assembler
 * - More & Better memory views
 * - asm syntax highlighting
 * - tooltips for byte annotations
 * - Step-through simulation
 * - Tests!
 * - Build in example instructions/programs
 *
 * Fixes/improvements:
 * - Fix jump label asm printing to be nasm compatible
 * - Make the instructions actually part of the memory
 * - Do segmentation properly?
 * - Ability to add more
 * - Add address to instruction view
 * - Proper error handling
 * - Improve perf!
 * - string instructions should be segment-prefixable, sadly
 */

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    AnnotatedInstructionComponent,
    NumPipe,
    FlagPipe,
    SimulatedInstructionComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly fb = inject(FormBuilder);

  annotatedInstructions?: ReadonlyArray<AnnotatedInstructionData>;

  simulatedInstructions?: ReadonlyArray<SimulatedInstruction>;

  fileName?: string;

  readonly simulationState: SimulationState = {
    ax: 0,
    bx: 0,
    cx: 0,
    dx: 0,

    bp: 0,
    sp: 2 ** 16 - 1,
    si: 0,
    di: 0,

    cs: 0,
    ds: 2 ** 12,
    es: 2 ** 13,
    ss: 2 ** 12 + 2 ** 13,

    ip: 0,

    trapFlag: false,
    directionFlag: false,
    interruptFlag: false,
    overflowFlag: false,
    signFlag: false,
    zeroFlag: false,
    auxCarryFlag: false,
    parityFlag: false,
    carryFlag: false,

    memory: new Memory(),
  };

  readonly memoryAddressFormArray = this.fb.array<FormControl<string>>([
    this.fb.control('0', { nonNullable: true }),
    this.fb.control('1', { nonNullable: true }),
  ]);

  readonly memoryValues = valueChangesWithInitial(this.memoryAddressFormArray).pipe(
    map((addresseStrings) => {
      return addresseStrings.map((addressString) => {
        if (/[^0-9a-fA-F]/.test(addressString)) {
          return '-';
        }

        const parsed = parseInt(addressString, 16);

        if (Number.isNaN(parsed) || parsed >= total8086MemorySizeInBytes || parsed < 0) {
          return '-';
        }

        const val = this.simulationState.memory.readByte(parsed);

        return `0x${printNum(val, 16, 2)} (${printNum(val, 10, 0)})`;
      });
    }),
  );

  gotFile(evt: Event): void {
    if (!(evt.target instanceof HTMLInputElement)) {
      throw Error('Internal error: got file from non-input element');
    }

    const reader = new FileReader();

    reader.addEventListener('load', (loadEvt) => {
      if (loadEvt.target?.result instanceof ArrayBuffer) {
        const instructionBytes = new Uint8Array(loadEvt.target.result);

        const decodedInstructions = decodeInstructions(instructionBytes);

        const annotatedInstructions = new Array<AnnotatedInstructionData>(decodedInstructions.size);

        const byteIndexToAsmMap = new Map<number, string>();

        let i = 0;
        for (const [byteIndex, instruction] of decodedInstructions) {
          const annotatedBits = encodeBitAnnotations(instruction);

          const asm = printDecodedInstruction(instruction, {
            spacesInAddressCalculation: false,
            plusPrefixDirectAddress: true,
          });

          byteIndexToAsmMap.set(byteIndex, asm);

          annotatedInstructions[i] = {
            lineNumber: i + 1,
            byteIndex,
            asm,
            instruction: instruction,
            annotatedBits,
          };

          i++;
        }

        this.annotatedInstructions = annotatedInstructions;

        const simulatedInstructions: SimulatedInstruction[] = [];

        // TODO probably put an explicit termination marker (just an implied halt?) in the decided instructions
        // so that we can tell the difference between getting to the end or getting to an invalid instruction
        // pointer
        // TODO do better infinte loop detection!
        let instructionsSimulated = 0;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          if (instructionsSimulated > 2000) {
            break;
          }

          const instruction = decodedInstructions.get(this.simulationState.ip);

          if (instruction === undefined) {
            break;
          }

          const asm = byteIndexToAsmMap.get(this.simulationState.ip);

          if (asm === undefined) {
            throw Error(
              `Internal error, could not find asm for instruction at address ${this.simulationState.ip}`,
            );
          }

          simulatedInstructions.push({
            simulationStateDiff: simulateInstruction(this.simulationState, instruction),
            asm,
          });

          instructionsSimulated++;
        }

        this.simulatedInstructions = simulatedInstructions;
      }
    });

    if (evt.target.files !== null) {
      this.fileName = evt.target.files[0].name.split(/(\\|\/)/g).pop();

      reader.readAsArrayBuffer(evt.target.files[0]);
    }
  }

  copyCaseyPrint(): void {
    if (this.simulatedInstructions) {
      navigator.clipboard.writeText(
        caseyPrint(this.fileName ?? '', this.simulationState, this.simulatedInstructions),
      );
    }
  }

  // TODO
  // download(): void {
  //   const blob = new Blob([this.instructionString]);

  //   const url = window.URL.createObjectURL(blob);

  //   const a = document.createElement('a');
  //   a.style.display = 'none';
  //   a.href = url;
  //   a.download = 'my-assembly.asm';

  //   document.body.appendChild(a);

  //   a.click();

  //   window.URL.revokeObjectURL(url);
  // }
}
