// src/product/product.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return await this.productsRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return await this.productsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return await this.productsRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const result = await this.productsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  /**
   * 🚀 FIX: Refactored to handle quantityChange (delta: positive for increase, negative for decrease).
   * This method replaces the absolute assignment logic and correctly handles stock management
   * for both HTTP PATCH and the microservice call from the Order Service.
   */
  async updateStock(id: number, quantityChange: number): Promise<Product> {
    const product = await this.findOne(id);
    
    const newStock = product.stockQuantity + quantityChange;

    if (newStock < 0) {
      throw new BadRequestException(
        `Insufficient stock for product "${product.name}". Cannot fulfill stock change of ${quantityChange}.`
      );
    }
    
    product.stockQuantity = newStock;
    return await this.productsRepository.save(product);
  }


  // --- Helper/Other Methods ---

  async checkAvailability(id: number, quantity: number): Promise<{ available: boolean; product: Product }> {
    const product = await this.findOne(id);
    return {
      available: product.stockQuantity >= quantity,
      product,
    };
  }

  async decreaseStock(id: number, quantity: number): Promise<Product> {
    // This method is now redundant but kept for compatibility. It can be implemented
    // as a simple wrapper: return this.updateStock(id, -quantity);
    const product = await this.findOne(id);
    
    if (product.stockQuantity < quantity) {
      throw new BadRequestException(
        `Insufficient stock for product "${product.name}". Available: ${product.stockQuantity}, Requested: ${quantity}`
      );
    }
    
    product.stockQuantity -= quantity;
    return await this.productsRepository.save(product);
  }

  async increaseStock(id: number, quantity: number): Promise<Product> {
    // This method is also redundant but kept for compatibility.
    return this.updateStock(id, quantity);
  }

  async checkBatchAvailability(items: Array<{ productId: number; quantity: number }>): Promise<{
    available: boolean;
    unavailableItems: Array<{ productId: number; requested: number; available: number }>;
  }> {
    const unavailableItems: Array<{ productId: number; requested: number; available: number }> = [];

    for (const item of items) {
      const product = await this.findOne(item.productId);
      if (product.stockQuantity < item.quantity) {
        unavailableItems.push({
          productId: item.productId,
          requested: item.quantity,
          available: product.stockQuantity,
        });
      }
    }

    return {
      available: unavailableItems.length === 0,
      unavailableItems,
    };
  }
}