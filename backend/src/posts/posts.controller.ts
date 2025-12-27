import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

// Configuración de almacenamiento para imágenes de posts
const postImagesStorage = diskStorage({
  destination: './uploads/posts',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    callback(null, `post-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

// Filtro para solo aceptar imágenes
const imageFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!/\/(jpg|jpeg|png|gif|webp)$/.exec(file.mimetype)) {
    return callback(new BadRequestException('Solo se permiten imágenes (jpg, jpeg, png, gif, webp)'), false);
  }
  callback(null, true);
};

@ApiTags('Posts')
@Controller('posts')
@UseGuards(ThrottlerGuard, JwtAuthGuard)
@ApiBearerAuth()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  async create(@CurrentUser() user: any, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(user.id, createPostDto);
  }

  @Post('upload-images')
  @ApiOperation({ summary: 'Upload images for posts' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: postImagesStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB por imagen
    }),
  )
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se han subido imágenes');
    }
    const imageUrls = files.map((file) => `/uploads/posts/${file.filename}`);
    return { images: imageUrls };
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['QUESTION', 'DISCUSSION', 'RESOURCE', 'EVENT', 'ANNOUNCEMENT'] })
  @ApiResponse({ status: 200, description: 'Posts retrieved successfully' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('type') type?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = type ? { type } : {};
    return this.postsService.findAll({
      skip,
      take: limit,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiResponse({ status: 200, description: 'Post retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findOne(@Param('id') id: string) {
    return this.postsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update post' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async update(@Param('id') id: string, @CurrentUser() user: any, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, user.id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete post' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.postsService.delete(id, user.id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Create a comment on a post' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  async createComment(
    @Param('id') postId: string,
    @CurrentUser() user: any,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.postsService.createComment(postId, user.id, createCommentDto);
  }

  @Delete('comments/:commentId')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  async deleteComment(@Param('commentId') commentId: string, @CurrentUser() user: any) {
    return this.postsService.deleteComment(commentId, user.id);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Like a post' })
  @ApiResponse({ status: 201, description: 'Post liked successfully' })
  async likePost(@Param('id') postId: string, @CurrentUser() user: any) {
    return this.postsService.likePost(postId, user.id);
  }

  @Delete(':id/like')
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiResponse({ status: 200, description: 'Post unliked successfully' })
  async unlikePost(@Param('id') postId: string, @CurrentUser() user: any) {
    return this.postsService.unlikePost(postId, user.id);
  }

  @Get(':id/liked')
  @ApiOperation({ summary: 'Check if user has liked a post' })
  @ApiResponse({ status: 200, description: 'Like status retrieved' })
  async hasUserLikedPost(@Param('id') postId: string, @CurrentUser() user: any) {
    const hasLiked = await this.postsService.hasUserLikedPost(postId, user.id);
    return { hasLiked };
  }
}
