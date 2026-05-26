import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { Store } from '../stores/entities/store.entity';
import { User } from '../users/entities/user.entity';
import { SubmitRatingDto } from './dto/submit-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getRatingsByStore(storeId: number): Promise<any[]> {
    const ratings = await this.ratingRepository.find({
      where: { storeId },
      relations: { user: true, store: true },
      order: { createdAt: 'DESC' },
    });

    return ratings.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.user.name,
      userEmail: r.user.email,
      storeId: r.storeId,
      storeName: r.store.name,
      rating: r.rating,
      createdAt: r.createdAt,
    }));
  }

  async submitRating(requestingUser: any, submitRatingDto: SubmitRatingDto): Promise<any> {
    const { userId, storeId, rating } = submitRatingDto;

    // Security check: user can only submit ratings for themselves
    if (requestingUser.id !== userId) {
      throw new ForbiddenException('You can only submit ratings for your own account');
    }

    // Role check: only "user" role can submit ratings
    if (requestingUser.role !== 'user') {
      throw new ForbiddenException('Only normal users can submit or modify ratings');
    }

    // Verify store exists
    const store = await this.storeRepository.findOne({ where: { id: storeId } });
    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    // Find if user already rated this store
    let ratingEntity = await this.ratingRepository.findOne({
      where: { userId, storeId },
    });

    if (ratingEntity) {
      ratingEntity.rating = rating;
    } else {
      ratingEntity = this.ratingRepository.create({
        userId,
        storeId,
        rating,
      });
    }

    const savedRating = await this.ratingRepository.save(ratingEntity);

    // Return fully populated rating
    const user = await this.userRepository.findOne({ where: { id: userId } });

    return {
      id: savedRating.id,
      userId: savedRating.userId,
      userName: user ? user.name : 'Unknown',
      userEmail: user ? user.email : 'unknown@email.com',
      storeId: savedRating.storeId,
      storeName: store.name,
      rating: savedRating.rating,
      createdAt: savedRating.createdAt,
    };
  }
}
