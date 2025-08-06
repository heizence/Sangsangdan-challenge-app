import { IsNotEmpty, IsNumber, IsString, IsUrl } from "class-validator";

export class CreateProofDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  participationId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUrl()
  imageUrl: string;
}
