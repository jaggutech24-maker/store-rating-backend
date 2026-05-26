import { IsEmail, IsNotEmpty, IsIn, Length, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  @Length(20, 60, { message: 'Name must be between 20 and 60 characters long' })
  name: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Address is required' })
  @Length(1, 400, { message: 'Address must be between 1 and 400 characters long' })
  address: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(16, { message: 'Password cannot exceed 16 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/, {
    message: 'Password must be 8-16 characters and include at least one uppercase letter and one special character',
  })
  password: string;

  @IsNotEmpty({ message: 'Role is required' })
  @IsIn(['admin', 'user', 'store_owner'], { message: 'Role must be admin, user, or store_owner' })
  role: 'admin' | 'user' | 'store_owner';
}
