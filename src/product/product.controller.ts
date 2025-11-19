// // src/product/product.controller.ts
// import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
// import { MessagePattern, Payload } from '@nestjs/microservices';
// import { ProductService } from './product.service';
// import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';

// @Controller('products')
// export class ProductController {
//   constructor(private readonly productService: ProductService) {}

//   // =========================================================
//   // ========== REST API ENDPOINTS (HTTP) ==========
//   // =========================================================
  
//   // ... (create, findAll, findOne, update, remove remain the same) ...

//   @Post()
//   async createProduct(@Body() createProductDto: CreateProductDto) {
//     return this.productService.create(createProductDto);
//   }

//   @Get()
//   async getAllProducts() {
//     return this.productService.findAll();
//   }

//   @Get(':id')
//   async getProduct(@Param('id', ParseIntPipe) id: number) {
//     return this.productService.findOne(id);
//   }

//   @Patch(':id')
//   async updateProduct(
//     @Param('id', ParseIntPipe) id: number,
//     @Body() updateProductDto: UpdateProductDto,
//   ) {
//     return this.productService.update(id, updateProductDto);
//   }

//   @Delete(':id')
//   async deleteProduct(@Param('id', ParseIntPipe) id: number) {
//     await this.productService.remove(id);
//     return { message: 'Product deleted successfully' };
//   }

//   /**
//    * Rerouting the HTTP PATCH to use the delta-based updateStock.
//    * Assuming 'quantity' in the body means the amount to change (delta), 
//    * NOT the final absolute stock.
//    */
//   @Patch(':id/stock')
//   async updateStock(
//     @Param('id', ParseIntPipe) id: number,
//     @Body('quantity', ParseIntPipe) quantityChange: number, // Renamed for clarity
//   ) {
//     // Calls the delta-based service method
//     return this.productService.updateStock(id, quantityChange); 
//   }

//   // =========================================================
//   // ========== MICROSERVICE PATTERNS (TCP) ==========
//   // =========================================================

//   // FIX 1: Handler required by the Order Service for product lookup (Correct)
//   @MessagePattern('product.findOne')
//   async findOneForOrderService(@Payload() productId: number) {
//     return this.productService.findOne(productId);
//   }
  
//   // FIX 2: Handler required by the Order Service for stock updates (Correct)
//   @MessagePattern('product.stock.update')
//   async updateStockForOrderService(@Payload() data: { productId: number, quantityChange: number }) {
//     // Calls the delta-based service method
//     return this.productService.updateStock(data.productId, data.quantityChange);
//   }
  
//   // --- Existing Microservice Patterns ---

//   @MessagePattern('create_product')
//   async createProductMicroservice(createProductDto: CreateProductDto) {
//     return this.productService.create(createProductDto);
//   }

//   @MessagePattern('find_all_products')
//   async findAllMicroservice() {
//     return this.productService.findAll();
//   }

//   @MessagePattern('find_product_by_id')
//   async findOneMicroservice(data: { id: number }) {
//     return this.productService.findOne(data.id);
//   }

//   @MessagePattern('update_product')
//   async updateMicroservice(data: { id: number; updateProductDto: UpdateProductDto }) {
//     return this.productService.update(data.id, data.updateProductDto);
//   }

//   @MessagePattern('remove_product')
//   async removeMicroservice(data: { id: number }) {
//     return this.productService.remove(data.id);
//   }

//   @MessagePattern('update_product_stock')
//   async updateStockMicroservice(@Payload() data: { id: number; quantity: number }) {
//     // This handler likely expected a delta, so it's also corrected to use the delta-based method
//     return this.productService.updateStock(data.id, data.quantity); 
//   }

//   @MessagePattern('check_product_availability')
//   async checkAvailability(@Payload() data: { id: number; quantity: number }) {
//     return this.productService.checkAvailability(data.id, data.quantity);
//   }

//   @MessagePattern('decrease_product_stock')
//   async decreaseStock(@Payload() data: { id: number; quantity: number }) {
//     // Call the legacy method, which is now functionally similar to updateStock with a negative delta
//     return this.productService.decreaseStock(data.id, data.quantity);
//   }
// }


// src/product/product.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// ✅ REGULAR PRODUCTS CONTROLLER
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  async getAllProducts() {
    return this.productService.findAll();
  }

  @Get(':id')
  async getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    await this.productService.remove(id);
    return { message: 'Product deleted successfully' };
  }

  @Patch(':id/stock')
  async updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) quantityChange: number,
  ) {
    return this.productService.updateStock(id, quantityChange);
  }

  // =========================================================
  // ========== MICROSERVICE PATTERNS (TCP) ==========
  // =========================================================

  @MessagePattern('product.findOne')
  async findOneForOrderService(@Payload() productId: number) {
    return this.productService.findOne(productId);
  }

  @MessagePattern('product.stock.update')
  async updateStockForOrderService(@Payload() data: { productId: number; quantityChange: number }) {
    return this.productService.updateStock(data.productId, data.quantityChange);
  }

  @MessagePattern('create_product')
  async createProductMicroservice(createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @MessagePattern('find_all_products')
  async findAllMicroservice() {
    return this.productService.findAll();
  }

  @MessagePattern('find_product_by_id')
  async findOneMicroservice(data: { id: number }) {
    return this.productService.findOne(data.id);
  }

  @MessagePattern('update_product')
  async updateMicroservice(data: { id: number; updateProductDto: UpdateProductDto }) {
    return this.productService.update(data.id, data.updateProductDto);
  }

  @MessagePattern('remove_product')
  async removeMicroservice(data: { id: number }) {
    return this.productService.remove(data.id);
  }

  @MessagePattern('update_product_stock')
  async updateStockMicroservice(@Payload() data: { id: number; quantity: number }) {
    return this.productService.updateStock(data.id, data.quantity);
  }

  @MessagePattern('check_product_availability')
  async checkAvailability(@Payload() data: { id: number; quantity: number }) {
    return this.productService.checkAvailability(data.id, data.quantity);
  }

  @MessagePattern('decrease_product_stock')
  async decreaseStock(@Payload() data: { id: number; quantity: number }) {
    return this.productService.decreaseStock(data.id, data.quantity);
  }
}

// ✅ SEPARATE ADMIN PRODUCTS CONTROLLER
@Controller('admin/products')
export class AdminProductController {
  constructor(private readonly productService: ProductService) {}

  // GET /admin/products/statistics - Must be BEFORE /admin/products/:id
  @Get('statistics')
  async getProductStatistics() {
    const products = await this.productService.findAll();

    return {
      success: true,
      data: {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.stockQuantity > 0).length,
        outOfStock: products.filter(p => p.stockQuantity === 0).length,
        lowStock: products.filter(p => p.stockQuantity > 0 && p.stockQuantity < 10).length,
      },
    };
  }

  // GET /admin/products
  @Get()
  async getAdminProducts(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const products = await this.productService.findAll();
    const total = products.length;
    const paginatedProducts = products.slice(skip, skip + limitNum);

    return {
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalCount: total,
          limit: limitNum,
        },
      },
    };
  }

  // GET /admin/products/:id
  @Get(':id')
  async getAdminProduct(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productService.findOne(id);
    return {
      success: true,
      data: product,
    };
  }

  // POST /admin/products
  @Post()
  async createAdminProduct(@Body() createProductDto: CreateProductDto) {
    const product = await this.productService.create(createProductDto);
    return {
      success: true,
      message: 'Product created successfully',
      data: product,
    };
  }

  // PATCH /admin/products/:id
  @Patch(':id')
  async updateAdminProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productService.update(id, updateProductDto);
    return {
      success: true,
      message: 'Product updated successfully',
      data: product,
    };
  }

  // DELETE /admin/products/:id
  @Delete(':id')
  async deleteAdminProduct(@Param('id', ParseIntPipe) id: number) {
    await this.productService.remove(id);
    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }
}