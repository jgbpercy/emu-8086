import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  FormRecord,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  ɵRawValue,
  ɵValue,
} from '@angular/forms';
import { Observable, defer } from 'rxjs';
import { startWith } from 'rxjs/operators';

/* eslint-disable @typescript-eslint/no-explicit-any */

export function valueChangesWithInitial<TValue = any>(
  control: FormControl<TValue>,
): Observable<TValue>;

export function valueChangesWithInitial<
  TControl extends { [K in keyof TControl]: AbstractControl<any, any> } = any,
>(group: FormGroup<TControl>): (typeof group)['valueChanges'];

export function valueChangesWithInitial<TControl extends AbstractControl<any> = any>(
  array: FormArray<TControl>,
): (typeof array)['valueChanges'];

export function valueChangesWithInitial<
  TControl extends AbstractControl<ɵValue<TControl>, ɵRawValue<TControl>> = AbstractControl,
>(record: FormRecord<TControl>): (typeof record)['valueChanges'];

export function valueChangesWithInitial(
  control: UntypedFormControl | UntypedFormGroup | UntypedFormArray,
): Observable<any>;

export function valueChangesWithInitial<TValue = any>(
  control: AbstractControl<TValue>,
): Observable<TValue> {
  return defer(() => control.valueChanges.pipe(startWith(control.value)));
}

/* eslint-enable @typescript-eslint/no-explicit-any */
