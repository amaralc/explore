import { IsInt, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  page?: number;
}
