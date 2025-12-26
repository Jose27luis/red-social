import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('EventsService', () => {
  let service: EventsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockOrganizer = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    profilePicture: null,
    role: 'PROFESSOR',
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
    maxAttendees: 100,
    isOnline: false,
    coverImage: null,
    qrCode: 'EVENT-123-abc',
    organizerId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    organizer: mockOrganizer,
    _count: { attendances: 0 },
  };

  const mockAttendance = {
    eventId: 'event-123',
    userId: 'user-456',
    confirmed: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      event: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      eventAttendance: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createEventDto = {
      title: 'New Event',
      description: 'Event description',
      startDate: futureDate.toISOString(),
      endDate: futureEndDate.toISOString(),
      location: 'Conference Room',
    };

    it('should create an event successfully', async () => {
      (prisma.event.create as jest.Mock).mockResolvedValue(mockEvent);

      const result = await service.create('user-123', createEventDto);

      expect(result).toEqual(mockEvent);
      expect(prisma.event.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when start date is in the past', async () => {
      const pastDto = {
        ...createEventDto,
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      };

      await expect(service.create('user-123', pastDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when end date is before start date', async () => {
      const invalidDto = {
        ...createEventDto,
        endDate: futureDate.toISOString(),
        startDate: futureEndDate.toISOString(),
      };

      await expect(service.create('user-123', invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated upcoming events', async () => {
      const events = [mockEvent];
      (prisma.event.findMany as jest.Mock).mockResolvedValue(events);
      (prisma.event.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll(0, 20);

      expect(result.data).toEqual(events);
      expect(result.meta.total).toBe(1);
    });

    it('should include past events when includeAll is true', async () => {
      (prisma.event.findMany as jest.Mock).mockResolvedValue([mockEvent]);
      (prisma.event.count as jest.Mock).mockResolvedValue(1);

      await service.findAll(0, 20, true);

      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return event with attendance info when user provided', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.eventAttendance.findUnique as jest.Mock).mockResolvedValue(mockAttendance);

      const result = await service.findById('event-123', 'user-456');

      expect(result.isAttending).toBe(true);
    });

    it('should throw NotFoundException when event not found', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = { title: 'Updated Event' };

    it('should update event when user is organizer', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.event.update as jest.Mock).mockResolvedValue({ ...mockEvent, ...updateDto });

      const result = await service.update('event-123', 'user-123', updateDto);

      expect(result.title).toBe('Updated Event');
    });

    it('should throw NotFoundException when event not found', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update('nonexistent-id', 'user-123', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not organizer', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

      await expect(service.update('event-123', 'other-user', updateDto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete event when user is organizer', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.event.delete as jest.Mock).mockResolvedValue(mockEvent);

      const result = await service.delete('event-123', 'user-123');

      expect(result).toEqual(mockEvent);
    });

    it('should throw ForbiddenException when user is not organizer', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

      await expect(service.delete('event-123', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('registerAttendance', () => {
    it('should register attendance successfully', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.eventAttendance.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.eventAttendance.create as jest.Mock).mockResolvedValue(mockAttendance);

      const result = await service.registerAttendance('event-123', 'user-456');

      expect(result).toEqual(mockAttendance);
    });

    it('should throw NotFoundException when event not found', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.registerAttendance('nonexistent-id', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when already registered', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.eventAttendance.findUnique as jest.Mock).mockResolvedValue(mockAttendance);

      await expect(service.registerAttendance('event-123', 'user-456')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when event is full', async () => {
      const fullEvent = { ...mockEvent, _count: { attendances: 100 } };
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(fullEvent);
      (prisma.eventAttendance.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.registerAttendance('event-123', 'user-456')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for past events', async () => {
      const pastEvent = { ...mockEvent, startDate: new Date(Date.now() - 24 * 60 * 60 * 1000) };
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(pastEvent);
      (prisma.eventAttendance.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.registerAttendance('event-123', 'user-456')).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelAttendance', () => {
    it('should cancel attendance successfully', async () => {
      (prisma.eventAttendance.findUnique as jest.Mock).mockResolvedValue(mockAttendance);
      (prisma.eventAttendance.delete as jest.Mock).mockResolvedValue(mockAttendance);

      const result = await service.cancelAttendance('event-123', 'user-456');

      expect(result.message).toContain('cancelled successfully');
    });

    it('should throw NotFoundException when attendance not found', async () => {
      (prisma.eventAttendance.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.cancelAttendance('event-123', 'user-456')).rejects.toThrow(NotFoundException);
    });
  });

  describe('confirmAttendance', () => {
    it('should confirm attendance with valid QR code', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.eventAttendance.findUnique as jest.Mock).mockResolvedValue(mockAttendance);
      (prisma.eventAttendance.update as jest.Mock).mockResolvedValue({ ...mockAttendance, confirmed: true });

      const result = await service.confirmAttendance('event-123', 'user-456', 'EVENT-123-abc');

      expect(result.message).toContain('confirmed successfully');
    });

    it('should throw BadRequestException for invalid QR code', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

      await expect(service.confirmAttendance('event-123', 'user-456', 'INVALID-QR')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when not registered', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.eventAttendance.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.confirmAttendance('event-123', 'user-456', 'EVENT-123-abc')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when already confirmed', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.eventAttendance.findUnique as jest.Mock).mockResolvedValue({ ...mockAttendance, confirmed: true });

      await expect(service.confirmAttendance('event-123', 'user-456', 'EVENT-123-abc')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getUserEvents', () => {
    it('should return user upcoming events', async () => {
      const attendances = [{ ...mockAttendance, event: mockEvent }];
      (prisma.eventAttendance.findMany as jest.Mock).mockResolvedValue(attendances);

      const result = await service.getUserEvents('user-456');

      expect(result).toHaveLength(1);
      expect(result[0].confirmed).toBe(false);
    });
  });
});
