import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'num',
  pure: true,
  standalone: true,
})
export class NumPipe implements PipeTransform {
  transform(value: number, radix: number, length: number): string {
    return printNum(value, radix, length);
  }
}

export function printNum(value: number, radix: number, length: number): string {
  return value.toString(radix).padStart(length, '0');
}
