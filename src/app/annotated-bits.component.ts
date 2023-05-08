import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, OnChanges } from '@angular/core';
import { DecodedInstruction } from './decoder';
import { AnnotatedBits } from './encoder';
import { NumPipe } from './num.pipe';

@Component({
  selector: 'annotated-bits',
  standalone: true,
  imports: [CommonModule, NumPipe],
  templateUrl: './annotated-bits.component.html',
  styleUrls: ['./annotated-bits.component.scss'],
})
export class AnnotatedBitsComponent implements OnChanges {
  @Input() bits!: AnnotatedBits;

  @Input() instruction!: DecodedInstruction;

  @HostBinding('class') bitsCategory?: string;

  ngOnChanges(): void {
    this.bitsCategory = this.bits.category;
  }
}
