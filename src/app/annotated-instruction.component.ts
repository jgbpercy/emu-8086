import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, OnChanges } from '@angular/core';
import { AnnotatedBitsComponent } from './annotated-bits.component';
import { DecodedInstruction } from './decoder';
import { AnnotatedBits } from './encoder';
import { SimulationStateDiff } from './simulator';

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
export class AnnotatedInstructionComponent implements OnChanges {
  @Input() annotatedInstruction!: AnnotatedInstructionData;

  @Input() simulationStateDiff?: SimulationStateDiff;

  @HostBinding('class.odd') isOddLineNumber = false;

  ngOnChanges(): void {
    this.isOddLineNumber = this.annotatedInstruction.lineNumber % 2 === 1;
  }
}
