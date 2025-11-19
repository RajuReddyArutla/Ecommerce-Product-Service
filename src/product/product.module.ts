// src/product/product.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController, AdminProductController } from './product.controller'; // ✅ Import both
import { Product } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductController, AdminProductController], // ✅ Register both
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}