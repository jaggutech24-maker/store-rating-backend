import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { Rating } from '../ratings/entities/rating.entity';
import { User } from '../users/entities/user.entity';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(requestingUserId?: number): Promise<any[]> {
    // Fetch all stores with owners
    const stores = await this.storeRepository.find({
      relations: { owner: true },
      order: { id: 'ASC' },
    });

    // Fetch all ratings to calculate metrics
    const ratings = await this.ratingRepository.find();

    return stores.map((store) => {
      const storeRatings = ratings.filter((r) => r.storeId === store.id);
      const totalRatings = storeRatings.length;
      
      const averageRating = totalRatings
        ? Math.round((storeRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings) * 10) / 10
        : 0;

      const userRatingObj = requestingUserId
        ? storeRatings.find((r) => r.userId === requestingUserId)
        : null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId,
        ownerName: store.owner ? store.owner.name : undefined,
        averageRating,
        totalRatings,
        userRating: userRatingObj ? userRatingObj.rating : null,
      };
    });
  }

  async findOne(id: number): Promise<any> {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: { owner: true },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    const ratings = await this.ratingRepository.find({ where: { storeId: id } });
    const totalRatings = ratings.length;
    const averageRating = totalRatings
      ? Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings) * 10) / 10
      : 0;

    return {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      ownerId: store.ownerId,
      ownerName: store.owner ? store.owner.name : undefined,
      averageRating,
      totalRatings,
    };
  }

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const { name, email, address, ownerId } = createStoreDto;

    // Check if email in use
    const existing = await this.storeRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Store with this email already exists');
    }

    let owner: User | null = null;
    if (ownerId) {
      owner = await this.userRepository.findOne({ where: { id: ownerId } });
      if (!owner) {
        throw new NotFoundException(`Owner user with ID ${ownerId} not found`);
      }
      if (owner.role !== 'store_owner') {
        throw new BadRequestException(`User with ID ${ownerId} is not a Store Owner`);
      }
    }

    const store = this.storeRepository.create({
      name,
      email,
      address,
      ownerId: ownerId || null,
    });

    return this.storeRepository.save(store);
  }
}
