import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AnnotatedInstructionComponent,
  AnnotatedInstructionData,
} from './annotated-instruction.component';
import { decodeInstructions } from './decoder';
import { encodeBitAnnotations } from './encoder';
import { FlagPipe } from './flag.pipe';
import { NumPipe } from './num.pipe';
import { printDecodedInstruction } from './printer';
import { SimulatedInstructionComponent } from './simulated-instruction.component';
import { SimulationState, SimulationStateDiff, simulateInstruction } from './simulator';

interface SimulatedInstruction {
  readonly simulationStateDiff: SimulationStateDiff;
  readonly asm: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    AnnotatedInstructionComponent,
    NumPipe,
    FlagPipe,
    SimulatedInstructionComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  annotatedInstructions?: ReadonlyArray<AnnotatedInstructionData>;

  simulatedInstructions?: ReadonlyArray<SimulatedInstruction>;

  readonly simulationState: SimulationState = {
    ax: 0,
    bx: 0,
    cx: 0,
    dx: 0,

    bp: 0,
    sp: 0,
    si: 0,
    di: 0,

    cs: 0,
    ds: 0,
    es: 0,
    ss: 0,

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
  };

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

          const asm = printDecodedInstruction(instruction);

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
      reader.readAsArrayBuffer(evt.target.files[0]);
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
