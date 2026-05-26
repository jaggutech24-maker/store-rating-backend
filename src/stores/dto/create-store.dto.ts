import { IsEmail, IsNotEmpty, IsOptional, IsInt, Length } from 'class-validator';

export class CreateStoreDto {
  @IsNotEmpty({ message: 'Store name is required' })
  @Length(20, 60, { message: 'Store name must be between 20 and 60 characters long' })
  name: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Address is required' })
  @Length(1, 400, { message: 'Address must be between 1 and 400 characters long' })
  address: string;

  @IsOptional()
  @IsInt({ message: 'Owner ID must be an integer' })
  ownerId?: number;
}
