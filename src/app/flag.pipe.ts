import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'flag',
  pure: true,
  standalone: true,
})
export class FlagPipe implements PipeTransform {
  transform(value: boolean): string {
    return printFlag(value);
  }
}

export function printFlag(value: boolean): string {
  return value ? '✔️' : '❌';
}
