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

      // Prevent invalid states
      if (reservation.status !== "PENDING") {
        throw new Error(
          "Reservation already processed"
        );
      }

      // Check expiry
      if (reservation.expiresAt < new Date()) {

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

        // Mark released
        await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: "RELEASED",
          },
        });

        return {
          expired: true,
        };
      }

      // Deduct stock permanently
      await tx.inventory.update({
        where: {
          id: reservation.inventoryId,
        },
        data: {
          totalStock: {
            decrement: reservation.quantity,
          },
          reservedStock: {
            decrement: reservation.quantity,
          },
        },
      });

      // Confirm reservation
      const updatedReservation =
        await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: "CONFIRMED",
          },
        });

      return {
        expired: false,
        reservation: updatedReservation,
      };
    });

    // Expired response
    if (result.expired) {
      return NextResponse.json(
        {
          error: "Reservation expired",
        },
        { status: 410 }
      );
    }

    return NextResponse.json(result.reservation);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Confirmation failed",
      },
      { status: 500 }
    );
  }
}