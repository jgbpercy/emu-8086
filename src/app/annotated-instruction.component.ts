import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AnnotatedBitsComponent } from './annotated-bits.component';
import { DecodedInstruction } from './decoder';
import { AnnotatedBits } from './encoder';

export interface AnnotatedInstructionData {
  readonly lineNumber: number;
  readonly asm: string;
  readonly instruction: DecodedInstruction;
  readonly annotatedBits: ReadonlyArray<AnnotatedBits>;
}

@Component({
  selector: 'annotated-instruction',
  standalone: true,
  imports: [CommonModule, AnnotatedBitsComponent],
  templateUrl: './annotated-instruction.component.html',
  styleUrls: ['./annotated-instruction.component.scss'],
})
export class AnnotatedInstructionComponent {
  @Input() annotatedInstruction!: AnnotatedInstructionData;
}
