import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD deben estar definidos en el entorno');
  }

  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
  const hashedPassword = await bcrypt.hash(password, rounds);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: UserRole.ADMIN,
      isVerified: true,
      isActive: true,
    },
    create: {
      email,
      password: hashedPassword,
      firstName: 'Administrador',
      lastName: 'UNAMAD',
      role: UserRole.ADMIN,
      isVerified: true,
      isActive: true,
    },
  });

  console.log(`Admin listo: ${admin.email} (rol ${admin.role}, verificado ${admin.isVerified})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
