import { Controller, Get, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Store } from '../stores/entities/store.entity';
import { Rating } from '../ratings/entities/rating.entity';
import { User } from '../users/entities/user.entity';

@Controller('store-owner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('store_owner')
export class StoreOwnerController {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    const ownerId = req.user.id;

    // Find the store owned by this user
    const store = await this.storeRepository.findOne({
      where: { ownerId },
      relations: { owner: true },
    });

    if (!store) {
      throw new NotFoundException('No store associated with this store owner account');
    }

    // Fetch ratings for this store
    const ratings = await this.ratingRepository.find({
      where: { storeId: store.id },
      relations: { user: true, store: true },
      order: { createdAt: 'DESC' },
    });

    const totalRatings = ratings.length;
    const averageRating = totalRatings
      ? Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings) * 10) / 10
      : 0;

    return {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId,
        ownerName: store.owner ? store.owner.name : undefined,
        averageRating,
        totalRatings,
      },
      ratings: ratings.map((r) => ({
        id: r.id,
        userId: r.userId,
        userName: r.user.name,
        userEmail: r.user.email,
        storeId: r.storeId,
        storeName: r.store.name,
        rating: r.rating,
        createdAt: r.createdAt,
      })),
    };
  }
}
