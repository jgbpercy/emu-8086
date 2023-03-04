import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { decodeInstructions } from './decoder';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  gotFile(evt: Event): void {
    console.log(evt);

    if (evt.target instanceof HTMLInputElement) {
      console.log(evt.target.files);

      const reader = new FileReader();
      reader.addEventListener('load', (loadEvt) => {
        console.log(loadEvt.target?.result);
        console.log(typeof loadEvt.target?.result);

        if (loadEvt.target?.result instanceof ArrayBuffer) {
          console.log(decodeInstructions(new Uint8Array(loadEvt.target?.result)));
        }
      });

      reader.readAsArrayBuffer(evt.target.files![0]);
    }
  }
}
