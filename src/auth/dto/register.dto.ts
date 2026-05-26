import { IsEmail, IsNotEmpty, Length, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Name is required' })
  @Length(20, 60, { message: 'Name must be between 20 and 60 characters long' })
  name: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Address is required' })
  @Length(1, 400, { message: 'Address must be between 1 and 400 characters long' })
  address: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}
