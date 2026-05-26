import { Controller, Get, Post, Body, Param, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { SubmitRatingDto } from './dto/submit-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get('store/:id')
  async getRatingsByStore(@Param('id', ParseIntPipe) id: number) {
    return this.ratingsService.getRatingsByStore(id);
  }

  @Post()
  async submitRating(@Req() req: any, @Body() submitRatingDto: SubmitRatingDto) {
    return this.ratingsService.submitRating(req.user, submitRatingDto);
  }
}
