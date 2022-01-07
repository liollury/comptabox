import { Converter } from '@witty-services/ts-serializer/dist/converter/converter';
import { Dayjs } from 'dayjs';
import { IDeserializer, ISerializer, SerializerOptions } from '@witty-services/ts-serializer';
import * as dayjs from 'dayjs';

export class FirestoreTimestampToDayjsConverter implements Converter<Dayjs, any> {

  fromJson(value: any, deserializer: IDeserializer, options?: SerializerOptions): Dayjs {
    if (value instanceof Date) {
      return dayjs(value);
    } else {
      return dayjs(value.toDate());
    }

  }

  toJson(value: Dayjs, serializer: ISerializer, options?: SerializerOptions): any {
    return value.toDate();
  }



}
