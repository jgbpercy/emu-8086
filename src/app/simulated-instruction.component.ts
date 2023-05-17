import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, OnChanges, Pipe, PipeTransform } from '@angular/core';
import { printFlag } from './flag.pipe';
import { printNum } from './num.pipe';
import { GenericSimulationStatePropertyDiff, MemoryDiff, SimulationStateDiff } from './simulator';

@Pipe({
  name: 'printRegisterMemoryDiff',
  pure: true,
  standalone: true,
})
export class RegisterMemoryDiffPipe implements PipeTransform {
  transform(
    value: GenericSimulationStatePropertyDiff<number> | MemoryDiff,
    isLast: boolean,
  ): string {
    if ('key' in value) {
      return `${value.key}: 0x${printNum(value.from, 16, 4)} -> 0x${printNum(value.to, 16, 4)}${
        isLast ? '' : ' | '
      }`;
    } else {
      return `mx${printNum(value.address, 16, 5)}: 0x${printNum(value.from, 16, 2)} -> 0x${printNum(
        value.to,
        16,
        2,
      )}${isLast ? '' : ' | '}`;
    }
  }
}

@Pipe({
  name: 'printFlagDiff',
  pure: true,
  standalone: true,
})
export class FlagDiffPipe implements PipeTransform {
  transform(value: GenericSimulationStatePropertyDiff<boolean>, isLast: boolean): string {
    return `${value.key.substring(0, 1)}:${printFlag(value.to)}${isLast ? '' : '|'}`;
  }
}

@Component({
  selector: 'simulated-instruction',
  standalone: true,
  imports: [CommonModule, RegisterMemoryDiffPipe, FlagDiffPipe],
  templateUrl: './simulated-instruction.component.html',
  styleUrls: ['./simulated-instruction.component.scss'],
})
export class SimulatedInstructionComponent implements OnChanges {
  @Input() simulationStateDiff!: SimulationStateDiff;

  registerDiffs!: ReadonlyArray<GenericSimulationStatePropertyDiff<number> | MemoryDiff>;
  flagDiffs!: ReadonlyArray<GenericSimulationStatePropertyDiff<boolean>>;

  @Input() asm!: string;

  @Input() @HostBinding('class.odd') odd = false;

  ngOnChanges(): void {
    this.registerDiffs = this.simulationStateDiff.filter(
      (diff): diff is GenericSimulationStatePropertyDiff<number> | MemoryDiff =>
        typeof diff.from === 'number',
    );

    this.flagDiffs = this.simulationStateDiff.filter(
      (diff): diff is GenericSimulationStatePropertyDiff<boolean> => typeof diff.from === 'boolean',
    );
  }
}
