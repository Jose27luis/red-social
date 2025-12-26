import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { BadRequestException } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('EventsController', () => {
  let controller: EventsController;
  let eventsService: jest.Mocked<EventsService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@unamad.edu.pe',
    firstName: 'John',
    lastName: 'Doe',
  };

  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const futureEndDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const mockEvent = {
    id: 'event-123',
    title: 'Test Event',
    description: 'A test event',
    startDate: futureDate,
    endDate: futureEndDate,
    location: 'Main Hall',
    organizerId: 'user-123',
  };

  beforeEach(async () => {
    const mockEventsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      registerAttendance: jest.fn(),
      cancelAttendance: jest.fn(),
      confirmAttendance: jest.fn(),
      getUserEvents: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: mockEventsService }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EventsController>(EventsController);
    eventsService = module.get(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const createDto = {
        title: 'New Event',
        description: 'Description',
        startDate: futureDate.toISOString(),
        endDate: futureEndDate.toISOString(),
        location: 'Room 101',
      };
      eventsService.create.mockResolvedValue(mockEvent as any);

      const result = await controller.create(mockUser, createDto as any);

      expect(result).toEqual(mockEvent);
      expect(eventsService.create).toHaveBeenCalledWith(mockUser.id, createDto);
    });
  });

  describe('uploadCover', () => {
    it('should upload cover image', async () => {
      const file = { filename: 'event-123.jpg' } as Express.Multer.File;

      const result = await controller.uploadCover(file);

      expect(result.coverImage).toContain('/uploads/events/');
    });

    it('should throw BadRequestException when no file provided', async () => {
      await expect(controller.uploadCover(undefined as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated events', async () => {
      const paginatedResult = { data: [mockEvent], meta: { total: 1 } };
      eventsService.findAll.mockResolvedValue(paginatedResult as any);

      const result = await controller.findAll(1, 20, false);

      expect(result).toEqual(paginatedResult);
      expect(eventsService.findAll).toHaveBeenCalledWith(0, 20, false);
    });

    it('should include past events when includeAll is true', async () => {
      eventsService.findAll.mockResolvedValue({ data: [], meta: {} } as any);

      await controller.findAll(1, 20, true);

      expect(eventsService.findAll).toHaveBeenCalledWith(0, 20, true);
    });
  });

  describe('getUserEvents', () => {
    it('should return user events', async () => {
      const userEvents = [mockEvent];
      eventsService.getUserEvents.mockResolvedValue(userEvents as any);

      const result = await controller.getUserEvents(mockUser);

      expect(result).toEqual(userEvents);
    });
  });

  describe('findById', () => {
    it('should return an event by id', async () => {
      eventsService.findById.mockResolvedValue(mockEvent as any);

      const result = await controller.findById('event-123', mockUser);

      expect(result).toEqual(mockEvent);
      expect(eventsService.findById).toHaveBeenCalledWith('event-123', mockUser.id);
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const updateDto = { title: 'Updated Event' };
      const updatedEvent = { ...mockEvent, ...updateDto };
      eventsService.update.mockResolvedValue(updatedEvent as any);

      const result = await controller.update('event-123', mockUser, updateDto as any);

      expect(result).toEqual(updatedEvent);
    });
  });

  describe('delete', () => {
    it('should delete an event', async () => {
      eventsService.delete.mockResolvedValue(mockEvent as any);

      const result = await controller.delete('event-123', mockUser);

      expect(result).toEqual(mockEvent);
    });
  });

  describe('registerAttendance', () => {
    it('should register attendance', async () => {
      const attendance = { eventId: 'event-123', userId: 'user-123', confirmed: false };
      eventsService.registerAttendance.mockResolvedValue(attendance as any);

      const result = await controller.registerAttendance('event-123', mockUser);

      expect(result).toEqual(attendance);
    });
  });

  describe('cancelAttendance', () => {
    it('should cancel attendance', async () => {
      const response = { message: 'Attendance cancelled successfully' };
      eventsService.cancelAttendance.mockResolvedValue(response);

      const result = await controller.cancelAttendance('event-123', mockUser);

      expect(result).toEqual(response);
    });
  });

  describe('confirmAttendance', () => {
    it('should confirm attendance with QR code', async () => {
      const response = { message: 'Attendance confirmed successfully' };
      eventsService.confirmAttendance.mockResolvedValue(response as any);

      const result = await controller.confirmAttendance('event-123', mockUser, 'EVENT-QR-CODE');

      expect(result).toEqual(response);
      expect(eventsService.confirmAttendance).toHaveBeenCalledWith('event-123', mockUser.id, 'EVENT-QR-CODE');
    });
  });
});
