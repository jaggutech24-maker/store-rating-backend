import { IsInt, IsNotEmpty, Min, Max } from 'class-validator';

export class SubmitRatingDto {
  @IsNotEmpty({ message: 'User ID is required' })
  @IsInt({ message: 'User ID must be an integer' })
  userId: number;

  @IsNotEmpty({ message: 'Store ID is required' })
  @IsInt({ message: 'Store ID must be an integer' })
  storeId: number;

  @IsNotEmpty({ message: 'Rating is required' })
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating: number;
}
