import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new event
   */
  async create(organizerId: string, data: CreateEventDto) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // Validate dates
    if (startDate < new Date()) {
      throw new BadRequestException('Event start date cannot be in the past');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('Event end date must be after start date');
    }

    // Generate QR code (simplified - in production use a proper QR library)
    const qrCode = `EVENT-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const event = await this.prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startDate,
        endDate,
        location: data.location,
        maxAttendees: data.maxAttendees || 500,
        isOnline: data.isOnline || false,
        coverImage: data.coverImage,
        qrCode,
        organizerId,
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            role: true,
          },
        },
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });

    return event;
  }

  /**
   * Find all upcoming events
   */
  async findAll(skip = 0, take = 20, includeAll = false) {
    const where: any = {};

    if (!includeAll) {
      where.startDate = {
        gte: new Date(),
      };
    }

    return this.prisma.event.findMany({
      where,
      skip,
      take,
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            role: true,
          },
        },
        _count: {
          select: {
            attendances: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  /**
   * Find event by ID
   */
  async findById(id: string, userId?: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            role: true,
          },
        },
        attendances: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if current user is attending
    let isAttending = false;
    let attendanceStatus = null;
    if (userId) {
      const attendance = await this.prisma.eventAttendance.findUnique({
        where: {
          eventId_userId: {
            eventId: id,
            userId,
          },
        },
      });
      isAttending = !!attendance;
      attendanceStatus = attendance;
    }

    return {
      ...event,
      isAttending,
      attendanceStatus,
    };
  }

  /**
   * Update event
   */
  async update(id: string, userId: string, data: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only organizer can update
    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only event organizer can update the event');
    }

    // Validate dates if provided
    if (data.startDate || data.endDate) {
      const startDate = data.startDate ? new Date(data.startDate) : event.startDate;
      const endDate = data.endDate ? new Date(data.endDate) : event.endDate;

      if (startDate < new Date()) {
        throw new BadRequestException('Event start date cannot be in the past');
      }

      if (endDate <= startDate) {
        throw new BadRequestException('Event end date must be after start date');
      }
    }

    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.location !== undefined) updateData.location = data.location;
    if (data.maxAttendees) updateData.maxAttendees = data.maxAttendees;
    if (data.isOnline !== undefined) updateData.isOnline = data.isOnline;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;

    return this.prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });
  }

  /**
   * Delete event
   */
  async delete(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only organizer can delete
    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only event organizer can delete the event');
    }

    return this.prisma.event.delete({ where: { id } });
  }

  /**
   * Register attendance for an event
   */
  async registerAttendance(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if already registered
    const existingAttendance = await this.prisma.eventAttendance.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existingAttendance) {
      throw new BadRequestException('You are already registered for this event');
    }

    // Check if event is full
    if (event._count.attendances >= event.maxAttendees) {
      throw new BadRequestException('Event has reached maximum capacity');
    }

    // Check if event has already passed
    if (event.startDate < new Date()) {
      throw new BadRequestException('Cannot register for past events');
    }

    const attendance = await this.prisma.eventAttendance.create({
      data: {
        eventId,
        userId,
        confirmed: false,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            qrCode: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return attendance;
  }

  /**
   * Cancel attendance
   */
  async cancelAttendance(eventId: string, userId: string) {
    const attendance = await this.prisma.eventAttendance.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }

    await this.prisma.eventAttendance.delete({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    return { message: 'Attendance cancelled successfully' };
  }

  /**
   * Confirm attendance (usually via QR code scan)
   */
  async confirmAttendance(eventId: string, userId: string, qrCode: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Verify QR code
    if (event.qrCode !== qrCode) {
      throw new BadRequestException('Invalid QR code');
    }

    const attendance = await this.prisma.eventAttendance.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance not found. Please register first.');
    }

    if (attendance.confirmed) {
      throw new BadRequestException('Attendance already confirmed');
    }

    const updatedAttendance = await this.prisma.eventAttendance.update({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
      data: {
        confirmed: true,
      },
    });

    return {
      message: 'Attendance confirmed successfully',
      attendance: updatedAttendance,
    };
  }

  /**
   * Get user's upcoming events
   */
  async getUserEvents(userId: string) {
    const attendances = await this.prisma.eventAttendance.findMany({
      where: {
        userId,
        event: {
          startDate: {
            gte: new Date(),
          },
        },
      },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
              },
            },
            _count: {
              select: {
                attendances: true,
              },
            },
          },
        },
      },
      orderBy: {
        event: {
          startDate: 'asc',
        },
      },
    });

    return attendances.map((a) => ({
      ...a.event,
      confirmed: a.confirmed,
      registeredAt: a.createdAt,
    }));
  }
}
