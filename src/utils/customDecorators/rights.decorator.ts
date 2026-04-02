import { SetMetadata } from '@nestjs/common';
import { Right } from '../enum/right.enum';

export const RIGHT_KEY = 'rights';
export const Rights = (...rights: Right[]) => SetMetadata(RIGHT_KEY, rights);
