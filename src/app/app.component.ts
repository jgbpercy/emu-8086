import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { decodeInstructions } from './decoder';
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

  gotFile(evt: Event): void {
    console.log(evt);

    if (evt.target instanceof HTMLInputElement) {
      console.log(evt.target.files);

      const reader = new FileReader();
      reader.addEventListener('load', (loadEvt) => {
        console.log(loadEvt.target?.result);
        console.log(typeof loadEvt.target?.result);

        if (loadEvt.target?.result instanceof ArrayBuffer) {
          const decodedInstructions = decodeInstructions(new Uint8Array(loadEvt.target.result));

          console.log(decodedInstructions);
          this.instructionString = printDecodedInstructions(decodedInstructions);
        }
      });

      if (evt.target.files !== null) {
        reader.readAsArrayBuffer(evt.target.files[0]);
      }
    }
  }
}
