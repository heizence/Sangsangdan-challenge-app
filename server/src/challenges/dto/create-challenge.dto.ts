import { IsString, IsNotEmpty, IsDateString, IsEnum, IsUrl } from "class-validator";

export class CreateChallengeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsUrl()
  thumbnail: string;

  @IsEnum(["DAILY", "WEEKDAY", "WEEKEND", "N_PER_WEEK"])
  frequency: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsEnum(["ONCE", "MULTIPLE"])
  authCountPerDay: string;

  @IsString()
  @IsNotEmpty()
  authDescription: string;
}
