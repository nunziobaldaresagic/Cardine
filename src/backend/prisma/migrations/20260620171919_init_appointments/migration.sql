-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'PROPOSED', 'CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "appointments" (
    "id"          TEXT                NOT NULL,
    "employeeId"  TEXT                NOT NULL,
    "counselorId" TEXT                NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "status"      "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "notes"       TEXT,
    "createdAt"   TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3)        NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);
