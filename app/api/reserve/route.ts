import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { inventoryId, quantity } = body;

    // Basic validation
    if (!inventoryId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const reservation = await prisma.$transaction(async (tx) => {

      // Fetch inventory
      const inventory = await tx.inventory.findUnique({
        where: {
          id: inventoryId,
        },
      });

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      // Calculate available stock
      const availableStock =
        inventory.totalStock - inventory.reservedStock;

      // Prevent overselling
      if (availableStock < quantity) {
        return null;
      }

      // Reserve stock
      await tx.inventory.update({
        where: {
          id: inventoryId,
        },
        data: {
          reservedStock: {
            increment: quantity,
          },
        },
      });

      // Reservation expires in 10 minutes
      const expiresAt = new Date(
        Date.now() + 10 * 60 * 1000
      );

      // Create reservation
      const createdReservation =
        await tx.reservation.create({
          data: {
            inventoryId,
            quantity,
            expiresAt,
          },
        });

      return createdReservation;
    });

    // Conflict response
    if (!reservation) {
      return NextResponse.json(
        {
          error:
            "Another customer reserved the remaining stock",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(reservation);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Reservation failed",
      },
      { status: 500 }
    );
  }
}