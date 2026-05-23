import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await context.params;

    const result = await prisma.$transaction(async (tx) => {

      // Find reservation
      const reservation =
        await tx.reservation.findUnique({
          where: {
            id,
          },
        });

      if (!reservation) {
        throw new Error("Reservation not found");
      }

      // Only pending reservations can be released
      if (reservation.status !== "PENDING") {
        throw new Error(
          "Only pending reservations can be released"
        );
      }

      // Release reserved stock
      await tx.inventory.update({
        where: {
          id: reservation.inventoryId,
        },
        data: {
          reservedStock: {
            decrement: reservation.quantity,
          },
        },
      });

      // Update reservation status
      const updatedReservation =
        await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: "RELEASED",
          },
        });

      return updatedReservation;
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Release failed",
      },
      { status: 500 }
    );
  }
}