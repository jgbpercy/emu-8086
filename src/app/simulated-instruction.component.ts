import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, OnChanges, Pipe, PipeTransform } from '@angular/core';
import { printFlag } from './flag.pipe';
import { printNum } from './num.pipe';
import { GenericSimulationStatePropertyDiff, SimulationStateDiff } from './simulator';

@Pipe({
  name: 'printRegisterDiff',
  pure: true,
  standalone: true,
})
export class RegisterDiffPipe implements PipeTransform {
  transform(value: GenericSimulationStatePropertyDiff<number>, isLast: boolean): string {
    return `${value.key}: 0x${printNum(value.from, 16, 4)} -> 0x${printNum(value.to, 16, 4)}${
      isLast ? '' : ' | '
    }`;
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
  imports: [CommonModule, RegisterDiffPipe, FlagDiffPipe],
  templateUrl: './simulated-instruction.component.html',
  styleUrls: ['./simulated-instruction.component.scss'],
})
export class SimulatedInstructionComponent implements OnChanges {
  @Input() simulationStateDiff!: SimulationStateDiff;

  registerDiffs!: ReadonlyArray<GenericSimulationStatePropertyDiff<number>>;
  flagDiffs!: ReadonlyArray<GenericSimulationStatePropertyDiff<boolean>>;

  @Input() asm!: string;

  @Input() @HostBinding('class.odd') odd = false;

  ngOnChanges(): void {
    this.registerDiffs = this.simulationStateDiff.filter(
      (diff): diff is GenericSimulationStatePropertyDiff<number> =>
        'key' in diff && typeof diff.from === 'number',
    );

    this.flagDiffs = this.simulationStateDiff.filter(
      (diff): diff is GenericSimulationStatePropertyDiff<boolean> => typeof diff.from === 'boolean',
    );
  }
}
