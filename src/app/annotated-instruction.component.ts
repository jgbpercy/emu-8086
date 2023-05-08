import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, OnChanges, Pipe, PipeTransform } from '@angular/core';
import { AnnotatedBitsComponent } from './annotated-bits.component';
import { DecodedInstruction } from './decoder';
import { AnnotatedBits } from './encoder';
import { printFlag } from './flag.pipe';
import { printNum } from './num.pipe';
import { SimulationStateDiff, SimulationStatePropertyDiff } from './simulator';

export interface AnnotatedInstructionData {
  readonly lineNumber: number;
  readonly asm: string;
  readonly instruction: DecodedInstruction;
  readonly annotatedBits: ReadonlyArray<AnnotatedBits>;
}

@Pipe({
  name: 'printDiff',
  pure: true,
  standalone: true,
})
export class DiffPipe implements PipeTransform {
  transform(value: SimulationStatePropertyDiff): string {
    if (typeof value.from === 'number') {
      return `${value.key}: 0x${printNum(value.from, 16, 4)} -> 0x${printNum(value.to, 16, 4)}`;
    } else {
      return `${value.key.substring(0, 1)}:${printFlag(value.from)}->${printFlag(value.to)}`;
    }
  }
}

@Component({
  selector: 'annotated-instruction',
  standalone: true,
  templateUrl: './annotated-instruction.component.html',
  styleUrls: ['./annotated-instruction.component.scss'],
  imports: [CommonModule, AnnotatedBitsComponent, DiffPipe],
})
export class AnnotatedInstructionComponent implements OnChanges {
  @Input() annotatedInstruction!: AnnotatedInstructionData;

  @Input() simulationStateDiff?: SimulationStateDiff;

  @HostBinding('class.odd') isOddLineNumber = false;

  ngOnChanges(): void {
    this.isOddLineNumber = this.annotatedInstruction.lineNumber % 2 === 1;
  }
}
