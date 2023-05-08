import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AnnotatedInstructionComponent,
  AnnotatedInstructionData,
} from './annotated-instruction.component';
import { decodeInstructions } from './decoder';
import { encodeBitAnnotations } from './encoder';
import { printDecodedInstruction } from './printer';
import { SimulationState, SimulationStateDiff, simulateInstruction } from './simulator';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AnnotatedInstructionComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  annotatedInstructions?: ReadonlyArray<
    AnnotatedInstructionData & { simulationStateDiff: SimulationStateDiff }
  >;

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

        // TODO temp duplicating stuff with printer here and in the template obv
        this.annotatedInstructions = decodedInstructions.map((instruction, i) => {
          const annotatedBits = encodeBitAnnotations(instruction);

          return {
            lineNumber: i + 1,
            asm: printDecodedInstruction(instruction),
            instruction: instruction,
            annotatedBits,
            simulationStateDiff: simulateInstruction(this.simulationState, instruction),
          };
        });
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
