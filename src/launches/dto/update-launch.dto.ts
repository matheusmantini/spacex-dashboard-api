import { PartialType } from '@nestjs/mapped-types';
import { CreateLaunchDto } from './create-launch.dto';

export class UpdateLaunchDto extends PartialType(CreateLaunchDto) {}
