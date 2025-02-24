const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Create default services
  const services = [
    {
      name: "Men's Haircut",
      description:
        "Classic men's haircut with styling, includes wash and blow dry",
      duration: 30,
      price: 25.0,
      image: "/images/services/mens-haircut.jpg",
    },
    {
      name: "Beard Trim",
      description:
        "Professional beard trimming and shaping with hot towel service",
      duration: 20,
      price: 15.0,
      image: "/images/services/beard-trim.jpg",
    },
    {
      name: "Hair & Beard Combo",
      description: "Complete haircut and beard grooming service with styling",
      duration: 45,
      price: 35.0,
      image: "/images/services/hair-beard-combo.jpg",
    },
    {
      name: "Kids Haircut",
      description: "Haircut for children under 12, includes styling",
      duration: 30,
      price: 20.0,
      image: "/images/services/kids-haircut.jpg",
    },
    {
      name: "Hot Shave",
      description: "Traditional hot towel straight razor shave",
      duration: 30,
      price: 25.0,
      image: "/images/services/hot-shave.jpg",
    },
    {
      name: "Hair Color",
      description: "Professional hair coloring service",
      duration: 60,
      price: 45.0,
      image: "/images/services/hair-color.jpg",
    },
  ];

  console.log("Seeding default services...");

  for (const service of services) {
    // Check if service already exists
    const existingService = await prisma.service.findFirst({
      where: { name: service.name },
    });

    if (!existingService) {
      await prisma.service.create({
        data: service,
      });
      console.log(`Created service: ${service.name}`);
    } else {
      // Update existing service
      await prisma.service.update({
        where: { id: existingService.id },
        data: service,
      });
      console.log(`Updated service: ${service.name}`);
    }
  }

  // Create default site settings if they don't exist
  const existingSettings = await prisma.siteSettings.findFirst({
    where: { active: true },
  });

  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        active: true,
        data: {
          businessName: "Modern Barbershop",
          businessHours: {
            monday: { open: "09:00", close: "17:00" },
            tuesday: { open: "09:00", close: "17:00" },
            wednesday: { open: "09:00", close: "17:00" },
            thursday: { open: "09:00", close: "17:00" },
            friday: { open: "09:00", close: "17:00" },
            saturday: { open: "10:00", close: "16:00" },
            sunday: { open: null, close: null },
          },
          contactInfo: {
            phone: "+1 (555) 123-4567",
            email: "info@modernbarbershop.com",
            address: "123 Main St, City, State 12345",
          },
          slotDuration: 30, // minutes
          maxAdvanceBooking: 30, // days
        },
      },
    });
    console.log("Created default site settings");
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
