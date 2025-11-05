import { db } from "../server/db";
import { properties, units, tenants, transactions, activityLogs } from "../shared/schema";

async function seed() {
  console.log("Seeding database...");

  await db.delete(activityLogs);
  await db.delete(transactions);
  await db.delete(tenants);
  await db.delete(units);
  await db.delete(properties);

  const [property1, property2] = await db
    .insert(properties)
    .values([
      {
        name: "Sunrise Apartments",
        address: "123 Main Street, Downtown",
      },
      {
        name: "Green Valley Complex",
        address: "456 Oak Avenue, Westside",
      },
    ])
    .returning();

  console.log("Created properties");

  const [unit1, unit2, unit3, unit4] = await db
    .insert(units)
    .values([
      {
        name: "A-101",
        propertyId: property1.id,
        deposit: 15000,
        floor: 1,
        rent: 12000,
        maintenance: 2000,
        contractStart: new Date("2024-01-01"),
        contractEnd: new Date("2024-12-31"),
      },
      {
        name: "A-102",
        propertyId: property1.id,
        deposit: 15000,
        floor: 1,
        rent: 12000,
        maintenance: 2000,
        contractStart: new Date("2024-02-01"),
        contractEnd: new Date("2025-01-31"),
      },
      {
        name: "B-201",
        propertyId: property1.id,
        deposit: 18000,
        floor: 2,
        rent: 15000,
        maintenance: 2500,
        contractStart: null,
        contractEnd: null,
      },
      {
        name: "101",
        propertyId: property2.id,
        deposit: 20000,
        floor: 1,
        rent: 18000,
        maintenance: 3000,
        contractStart: new Date("2024-03-01"),
        contractEnd: new Date("2025-02-28"),
      },
    ])
    .returning();

  console.log("Created units");

  const [tenant1, tenant2, tenant3, tenant4] = await db
    .insert(tenants)
    .values([
      {
        status: "Active",
        name: "Rajesh Kumar",
        unitId: unit1.id,
        phone: "+91 9876543210",
        email: "rajesh.kumar@email.com",
        aadhar: "1234 5678 9012",
        address: "Chennai, Tamil Nadu",
        extraDetails: "Family of 4",
        emergencyContact: "+91 9876543211",
        dob: new Date("1985-05-15"),
        workDetails: "Software Engineer at Tech Corp",
        gender: "Male",
      },
      {
        status: "Active",
        name: "Priya Sharma",
        unitId: unit2.id,
        phone: "+91 9876543212",
        email: "priya.sharma@email.com",
        aadhar: "2345 6789 0123",
        address: "Mumbai, Maharashtra",
        extraDetails: "Working professional",
        emergencyContact: "+91 9876543213",
        dob: new Date("1990-08-22"),
        workDetails: "Marketing Manager",
        gender: "Female",
      },
      {
        status: "Active",
        name: "Amit Patel",
        unitId: unit4.id,
        phone: "+91 9876543214",
        email: "amit.patel@email.com",
        aadhar: "3456 7890 1234",
        address: "Bangalore, Karnataka",
        extraDetails: null,
        emergencyContact: "+91 9876543215",
        dob: new Date("1988-03-10"),
        workDetails: "Business Owner",
        gender: "Male",
      },
      {
        status: "Inactive",
        name: "Sunita Reddy",
        unitId: null,
        phone: "+91 9876543216",
        email: "sunita.reddy@email.com",
        aadhar: "4567 8901 2345",
        address: "Hyderabad, Telangana",
        extraDetails: "Moved to another city",
        emergencyContact: "+91 9876543217",
        dob: new Date("1992-11-05"),
        workDetails: "Teacher",
        gender: "Female",
      },
    ])
    .returning();

  console.log("Created tenants");

  await db.insert(transactions).values([
    {
      name: "Monthly Rent - January",
      transactionType: "Rent",
      isIncome: true,
      amount: "12000.00",
      date: new Date("2024-01-05"),
      paidBy: "Rajesh Kumar",
      unitId: unit1.id,
    },
    {
      name: "Security Deposit",
      transactionType: "Deposit",
      isIncome: true,
      amount: "15000.00",
      date: new Date("2024-01-01"),
      paidBy: "Rajesh Kumar",
      unitId: unit1.id,
    },
    {
      name: "Plumbing Repair",
      transactionType: "Repair",
      isIncome: false,
      amount: "3500.00",
      date: new Date("2024-01-15"),
      paidBy: "Property Manager",
      unitId: unit1.id,
    },
    {
      name: "Monthly Rent - February",
      transactionType: "Rent",
      isIncome: true,
      amount: "12000.00",
      date: new Date("2024-02-05"),
      paidBy: "Priya Sharma",
      unitId: unit2.id,
    },
    {
      name: "Electricity Bill",
      transactionType: "Electricity",
      isIncome: false,
      amount: "2200.00",
      date: new Date("2024-02-10"),
      paidBy: "Property Manager",
      unitId: unit1.id,
    },
    {
      name: "Water Bill",
      transactionType: "Water",
      isIncome: false,
      amount: "800.00",
      date: new Date("2024-02-10"),
      paidBy: "Property Manager",
      unitId: unit2.id,
    },
  ]);

  console.log("Created transactions");

  await db.insert(activityLogs).values([
    {
      entityType: "unit",
      entityId: unit1.id,
      action: "tenant_added",
      message: "Tenant Rajesh Kumar added to unit A-101",
    },
    {
      entityType: "unit",
      entityId: unit1.id,
      action: "transaction_added",
      message: "Security deposit of ₹15,000 received",
    },
    {
      entityType: "unit",
      entityId: unit2.id,
      action: "tenant_added",
      message: "Tenant Priya Sharma added to unit A-102",
    },
    {
      entityType: "property",
      entityId: property1.id,
      action: "unit_added",
      message: "New unit B-201 added",
    },
  ]);

  console.log("Created activity logs");
  console.log("Seed completed successfully!");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
