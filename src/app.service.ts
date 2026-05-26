import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Store } from './stores/entities/store.entity';
import { Rating } from './ratings/entities/rating.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(private readonly dataSource: DataSource) {}

  getHello(): string {
    return 'Hello World!';
  }

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    const userRepo = this.dataSource.getRepository(User);
    const storeRepo = this.dataSource.getRepository(Store);
    const ratingRepo = this.dataSource.getRepository(Rating);

    const userCount = await userRepo.count();
    if (userCount > 0) {
      console.log('Database already has users. Skipping auto-seeding.');
      return;
    }

    console.log('Seeding initial database data...');

    // 1. Seed Users
    const usersData = [
      {
        name: 'System Administrator Account',
        email: 'admin@storerate.com',
        address: '123 Admin Street, New York, NY 10001, United States of America',
        role: 'admin' as const,
        password: 'Admin@123456',
      },
      {
        name: 'John Michael Thompson Junior',
        email: 'john.thompson@email.com',
        address: '456 Oak Avenue, Los Angeles, CA 90001, United States of America',
        role: 'user' as const,
        password: 'User@123456',
      },
      {
        name: 'Sarah Elizabeth Johnson Williams',
        email: 'sarah.johnson@email.com',
        address: '789 Pine Road, Chicago, IL 60601, United States of America',
        role: 'user' as const,
        password: 'User@123456',
      },
      {
        name: 'Robert James Anderson Store',
        email: 'robert.anderson@techstore.com',
        address: '321 Tech Boulevard, San Francisco, CA 94101, United States',
        role: 'store_owner' as const,
        password: 'Owner@123456',
      },
      {
        name: 'Emily Rose Martinez Fashion',
        email: 'emily.martinez@fashionboutique.com',
        address: '654 Fashion Lane, Miami, FL 33101, United States of America',
        role: 'store_owner' as const,
        password: 'Owner@123456',
      },
      {
        name: 'Michael David Brown Coffee',
        email: 'michael.brown@coffeehouse.com',
        address: '987 Coffee Street, Seattle, WA 98101, United States of America',
        role: 'store_owner' as const,
        password: 'Owner@123456',
      },
      {
        name: 'Amanda Christine Wilson Davis',
        email: 'amanda.wilson@email.com',
        address: '147 Maple Drive, Austin, TX 78701, United States of America',
        role: 'user' as const,
        password: 'User@123456',
      },
      {
        name: 'Christopher Lee Jackson Admin',
        email: 'chris.jackson@storerate.com',
        address: '258 Admin Boulevard, Boston, MA 02101, United States of America',
        role: 'admin' as const,
        password: 'Admin@123456',
      },
    ];

    const usersMap = new Map<string, User>();
    for (const u of usersData) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      const user = userRepo.create({
        name: u.name,
        email: u.email,
        address: u.address,
        role: u.role,
        password: hashedPassword,
      });
      const savedUser = await userRepo.save(user);
      usersMap.set(u.email, savedUser);
    }
    console.log(`Successfully seeded ${usersMap.size} users.`);

    // 2. Seed Stores
    const storesData = [
      {
        name: 'Robert Anderson Tech Electronics Store',
        email: 'robert.anderson@techstore.com',
        address: '321 Tech Boulevard, San Francisco, CA 94101, United States',
        ownerEmail: 'robert.anderson@techstore.com',
      },
      {
        name: 'Emily Martinez Fashion Boutique Shop',
        email: 'emily.martinez@fashionboutique.com',
        address: '654 Fashion Lane, Miami, FL 33101, United States of America',
        ownerEmail: 'emily.martinez@fashionboutique.com',
      },
      {
        name: 'Michael Brown Premium Coffee House',
        email: 'michael.brown@coffeehouse.com',
        address: '987 Coffee Street, Seattle, WA 98101, United States of America',
        ownerEmail: 'michael.brown@coffeehouse.com',
      },
      {
        name: 'Downtown Fresh Grocery Market Place',
        email: 'downtown.grocery@market.com',
        address: '555 Market Street, Denver, CO 80201, United States of America',
        ownerEmail: null,
      },
      {
        name: 'Sunrise Organic Health Food Store',
        email: 'sunrise.organic@healthfood.com',
        address: '222 Organic Lane, Portland, OR 97201, United States of America',
        ownerEmail: null,
      },
    ];

    const storesMap = new Map<string, Store>();
    for (const s of storesData) {
      const owner = s.ownerEmail ? usersMap.get(s.ownerEmail) : null;
      const store = storeRepo.create({
        name: s.name,
        email: s.email,
        address: s.address,
        ownerId: owner ? owner.id : null,
      });
      const savedStore = await storeRepo.save(store);
      storesMap.set(s.name, savedStore);
    }
    console.log(`Successfully seeded ${storesMap.size} stores.`);

    // 3. Seed Ratings
    const ratingsData = [
      {
        userEmail: 'john.thompson@email.com',
        storeName: 'Robert Anderson Tech Electronics Store',
        rating: 4,
      },
      {
        userEmail: 'sarah.johnson@email.com',
        storeName: 'Robert Anderson Tech Electronics Store',
        rating: 5,
      },
      {
        userEmail: 'amanda.wilson@email.com',
        storeName: 'Robert Anderson Tech Electronics Store',
        rating: 4,
      },
      {
        userEmail: 'john.thompson@email.com',
        storeName: 'Michael Brown Premium Coffee House',
        rating: 5,
      },
      {
        userEmail: 'sarah.johnson@email.com',
        storeName: 'Emily Martinez Fashion Boutique Shop',
        rating: 3,
      },
    ];

    for (const r of ratingsData) {
      const user = usersMap.get(r.userEmail);
      const store = storesMap.get(r.storeName);
      if (user && store) {
        const rating = ratingRepo.create({
          userId: user.id,
          storeId: store.id,
          rating: r.rating,
        });
        await ratingRepo.save(rating);
      }
    }
    console.log('Successfully seeded ratings data.');
  }
}
