import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  DecodedInstruction,
  decodeInstructions,
  decodeInstructionsAndByteIndices,
} from './decoder';
import { AnnotatedBits, encodeAsAnnotatedBits } from './encoder';
import { printDecodedInstructions } from './printer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  instructionString = '';

  instructionBytes?: Uint8Array;

  annotatedInstructions?: { instruction: DecodedInstruction; bits: ReadonlyArray<AnnotatedBits> }[];

  gotFile(evt: Event): void {
    if (evt.target instanceof HTMLInputElement) {
      const reader = new FileReader();
      reader.addEventListener('load', (loadEvt) => {
        if (loadEvt.target?.result instanceof ArrayBuffer) {
          const instructionBytes = new Uint8Array(loadEvt.target.result);
          let index = 0;
          for (const byte of instructionBytes) {
            console.log(
              `${' '.repeat(4 - index.toString().length)}${index}: ${'0'.repeat(
                8 - byte.toString(2).length,
              )}${byte.toString(2)}`,
            );

            index++;
          }

          this.instructionBytes = instructionBytes;
        }
      });

      if (evt.target.files !== null) {
        reader.readAsArrayBuffer(evt.target.files[0]);
      }
    }
  }

  decodeAndPrint(): void {
    if (!this.instructionBytes) {
      throw Error('No bytes!');
    }

    const decodedInstructionsWithByteIndices = decodeInstructionsAndByteIndices(
      this.instructionBytes,
    );

    console.log(decodedInstructionsWithByteIndices);
    this.instructionString = printDecodedInstructions(
      decodedInstructionsWithByteIndices,
      this.instructionBytes,
    );
  }

  decodeAndPrintWithBytes(): void {
    if (!this.instructionBytes) {
      throw Error('No bytes!');
    }

    const decodedInstructionsWithByteIndices = decodeInstructionsAndByteIndices(
      this.instructionBytes,
    );

    console.log(decodedInstructionsWithByteIndices);
    this.instructionString = printDecodedInstructions(
      decodedInstructionsWithByteIndices,
      this.instructionBytes,
      {
        annotateBytes: { position: 'above', format: 'binary' },
      },
    );
  }

  incompleteDecodeAndAnnotate(): void {
    if (!this.instructionBytes) {
      throw Error('No bytes!');
    }

    const decodedInstructions = decodeInstructions(this.instructionBytes);

    console.log(decodedInstructions);
    this.annotatedInstructions = decodedInstructions.map((instruction) => ({
      instruction,
      bits: encodeAsAnnotatedBits(instruction),
    }));
  }

  download(): void {
    const blob = new Blob([this.instructionString]);

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'my-assembly.asm';

    document.body.appendChild(a);

    a.click();

    window.URL.revokeObjectURL(url);
  }
}
