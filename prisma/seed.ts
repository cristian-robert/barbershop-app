const { PrismaClient } = require('@prisma/client')
const { randomUUID } = require('crypto')

const prisma = new PrismaClient()

async function main() {
  // Delete existing data
  await prisma.appointment.deleteMany()
  await prisma.service.deleteMany()
  await prisma.user.deleteMany()
  await prisma.banner.deleteMany()
  await prisma.offer.deleteMany()

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'admin@barbershop.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  // Create services
  const services = [
    {
      name: "Men's Haircut",
      description: "Professional haircut service with wash and style",
      duration: 30,
      price: 30.0,
      image: "/images/services/mens-haircut.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Beard Trim",
      description: "Professional beard trimming and shaping",
      duration: 20,
      price: 20.0,
      image: "/images/services/beard-trim.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Hair Color",
      description: "Professional hair coloring service",
      duration: 90,
      price: 80.0,
      image: "/images/services/hair-color.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Hot Towel Shave",
      description: "Traditional hot towel straight razor shave",
      duration: 45,
      price: 40.0,
      image: "/images/services/hot-towel-shave.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  for (const service of services) {
    await prisma.service.create({
      data: service,
    })
  }

  // Create sample banner
  await prisma.banner.create({
    data: {
      title: "Holiday Special",
      content: "20% off all services this holiday season!",
      active: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  // Create sample offer
  await prisma.offer.create({
    data: {
      title: "First Time Customer",
      description: "Get 15% off your first haircut",
      discount: 15.0,
      active: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  console.log(`Database has been seeded. 🌱`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })