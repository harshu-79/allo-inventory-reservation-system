# Inventory Reservation System

A full-stack concurrency-safe inventory reservation platform built using Next.js, Prisma, PostgreSQL, and Supabase.

---

# Live Demo

https://allo-inventory-reservation-system-m.vercel.app/

---

# GitHub Repository

https://github.com/harshu-79/allo-inventory-reservation-system

---

# Tech Stack

## Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Sonner Toast Notifications

## Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- Supabase

## Deployment
- Vercel

- ---

# Features

## Inventory Management
- View products and warehouse inventory
- Real-time available stock updates
- Reserved stock tracking

## Reservation System
- Reserve inventory units
- Reservation expiration timer
- Confirm reservation
- Release reservation

## Concurrency-Safe Architecture
- Prevents overselling inventory
- Atomic reservation handling using Prisma transactions
- Handles race conditions during simultaneous reservations

## Real-Time UX
- Auto-refresh inventory updates
- Live reservation countdown
- Toast notifications for actions
- Production deployment with PostgreSQL database

- ---

# System Architecture

```txt
Frontend (Next.js + React)
        ↓
API Routes (Next.js Server)
        ↓
Prisma ORM
        ↓
PostgreSQL Database (Supabase)
