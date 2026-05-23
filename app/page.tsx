"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Inventory {
  id: string;
  warehouse: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  inventories: Inventory[];
}

export default function HomePage() {

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [activeReservation, setActiveReservation] =
    useState<any>(null);

  const [timeLeft, setTimeLeft] =
    useState("");

  // FETCH PRODUCTS

  async function fetchProducts() {

    try {

      const response = await fetch(
        "/api/products"
      );

      const data =
        await response.json();

      setProducts(data);

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to load inventory"
      );

    } finally {

      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // TIMER EFFECT

  useEffect(() => {

    if (!activeReservation) return;

    // STOP TIMER AFTER COMPLETION

    if (
      activeReservation.status !==
      "PENDING"
    ) {

      if (
        activeReservation.status ===
        "CONFIRMED"
      ) {

        setTimeLeft(
          "Completed ✅"
        );
      }

      if (
        activeReservation.status ===
        "RELEASED"
      ) {

        setTimeLeft(
          "Released ❌"
        );
      }

      return;
    }

    const interval = setInterval(() => {

      const expiry = new Date(
        activeReservation.expiresAt
      ).getTime();

      const now = Date.now();

      const difference =
        expiry - now;

      if (difference <= 0) {

        setTimeLeft("Expired");

        clearInterval(interval);

        return;
      }

      const minutes = Math.floor(
        difference / 1000 / 60
      );

      const seconds = Math.floor(
        (difference / 1000) % 60
      );

      setTimeLeft(
        `${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`
      );

    }, 1000);

    return () =>
      clearInterval(interval);

  }, [activeReservation]);

  // RESERVE

  async function handleReserve(
    inventoryId: string
  ) {

    try {

      const response = await fetch(
        "/api/reserve",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            inventoryId,
            quantity: 1,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.error
        );
      }

      setActiveReservation(data);

      toast.success(
        `${data.quantity} unit reserved successfully 🎉`
      );

      fetchProducts();

    } catch (error) {

      toast.error(
        error instanceof Error
          ? error.message
          : "Reservation failed"
      );
    }
  }

  // CONFIRM

  async function handleConfirm() {

    try {

      const response = await fetch(
        `/api/reservations/${activeReservation.id}/confirm`,
        {
          method: "POST",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.error
        );
      }

      setActiveReservation(data);

      toast.success(
        "Reservation confirmed successfully ✅"
      );

      fetchProducts();

    } catch (error) {

      toast.error(
        error instanceof Error
          ? error.message
          : "Confirmation failed"
      );
    }
  }

  // RELEASE

  async function handleRelease() {

    try {

      const response = await fetch(
        `/api/reservations/${activeReservation.id}/release`,
        {
          method: "POST",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.error
        );
      }

      setActiveReservation(data);

      toast.success(
        "Reservation released successfully"
      );

      fetchProducts();

    } catch (error) {

      toast.error(
        error instanceof Error
          ? error.message
          : "Release failed"
      );
    }
  }

  // LOADING SCREEN

  if (loading) {

    return (

      <main className="min-h-screen bg-black text-white flex items-center justify-center">

        <p className="text-lg">

          Loading inventory...

        </p>

      </main>
    );
  }

  return (

    <main className="min-h-screen bg-black text-white px-6 py-10">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-5xl font-bold mb-3">

            Inventory Reservation System

          </h1>

          <p className="text-zinc-400 text-lg">

            Real-time stock reservation with concurrency-safe inventory handling.

          </p>

        </div>

        {/* ACTIVE RESERVATION */}

        {activeReservation && (

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-2xl font-semibold mb-2">

                  Active Reservation

                </h2>

                <p className="text-zinc-400 text-sm break-all">

                  Reservation ID:
                  {" "}
                  {activeReservation.id}

                </p>

              </div>

              <span className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium">

                {activeReservation.status}

              </span>

            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-5">

              <div className="bg-zinc-950 rounded-2xl p-4">

                <p className="text-zinc-500 text-sm mb-1">

                  Quantity

                </p>

                <p className="text-xl font-semibold">

                  {activeReservation.quantity}

                </p>

              </div>

              <div className="bg-zinc-950 rounded-2xl p-4">

                <p className="text-zinc-500 text-sm mb-1">

                  Status

                </p>

                <p className="text-xl font-semibold">

                  {activeReservation.status}

                </p>

              </div>

              <div className="bg-zinc-950 rounded-2xl p-4">

                <p className="text-zinc-500 text-sm mb-1">

                  Expires In

                </p>

                <p className="text-xl font-semibold text-yellow-400">

                  {timeLeft}

                </p>

              </div>

            </div>

            {activeReservation.status ===
              "PENDING" && (

              <div className="flex gap-4">

                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-green-500 hover:bg-green-600 transition py-3 rounded-2xl font-semibold cursor-pointer"
                >

                  Confirm Reservation

                </button>

                <button
                  onClick={handleRelease}
                  className="flex-1 bg-red-500 hover:bg-red-600 transition py-3 rounded-2xl font-semibold cursor-pointer"
                >

                  Release Reservation

                </button>

              </div>
            )}

          </div>
        )}

        {/* PRODUCTS */}

        <div className="grid md:grid-cols-2 gap-6">

          {products.map((product) => (

            <div
              key={product.id}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition"
            >

              <div className="mb-5">

                <h2 className="text-2xl font-semibold mb-2">

                  {product.name}

                </h2>

                <p className="text-zinc-400">

                  {product.description}

                </p>

              </div>

              <div className="space-y-4">

                {product.inventories.map(
                  (inventory) => (

                    <div
                      key={inventory.id}
                      className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800"
                    >

                      <div className="flex items-center justify-between mb-3">

                        <p className="font-medium">

                          {inventory.warehouse}

                        </p>

                        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">

                          {
                            inventory.availableStock
                          }
                          {" "}
                          Available

                        </span>

                      </div>

                      {/* STATS */}

                      <div className="grid grid-cols-3 gap-3 text-sm mb-4">

                        <div className="bg-zinc-900 rounded-xl p-3">

                          <p className="text-zinc-500 mb-1">

                            Total

                          </p>

                          <p className="font-semibold">

                            {
                              inventory.totalStock
                            }

                          </p>

                        </div>

                        <div className="bg-zinc-900 rounded-xl p-3">

                          <p className="text-zinc-500 mb-1">

                            Reserved

                          </p>

                          <p className="font-semibold text-yellow-400">

                            {
                              inventory.reservedStock
                            }

                          </p>

                        </div>

                        <div className="bg-zinc-900 rounded-xl p-3">

                          <p className="text-zinc-500 mb-1">

                            Available

                          </p>

                          <p className="font-semibold text-green-400">

                            {
                              inventory.availableStock
                            }

                          </p>

                        </div>

                      </div>

                      {/* BUTTON */}

                      <button
                        onClick={() =>
                          handleReserve(
                            inventory.id
                          )
                        }

                        disabled={
                          inventory.availableStock <=
                          0
                        }

                        className="w-full bg-white text-black font-semibold py-3 rounded-2xl hover:bg-zinc-300 transition cursor-pointer disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed"
                      >

                        {inventory.availableStock >
                        0
                          ? "Reserve 1 Unit"
                          : "Out of Stock"}

                      </button>

                    </div>
                  )
                )}

              </div>

            </div>
          ))}

        </div>

      </div>

    </main>
  );
}