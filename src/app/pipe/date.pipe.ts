import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Dayjs } from 'dayjs';

@Pipe({name: 'appDate', pure: true})
export class AppDatePipe implements PipeTransform {
  private ngDatePipe: DatePipe;

  constructor(@Inject(LOCALE_ID) private locale: string) {
    this.ngDatePipe = new DatePipe(locale);
  }

  transform(value: Dayjs | any, format?: string, timezone?: string, locale?: string): string | null;
  transform(value: Dayjs | any, format?: string, timezone?: string, locale?: string): null;
  transform(value: Dayjs | any, format?: string, timezone?: string, locale?: string): string | null;
  transform(value: Dayjs | any, format = 'mediumDate', timezone?: string, locale?: string): string | null {
    return this.ngDatePipe.transform(value && value.toDate ? value.toDate() : value, format, timezone, locale);
  }
}
