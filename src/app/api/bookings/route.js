export const dynamic = "force-static";

import clientPromise from "../../../dbConnect";
import { ObjectId } from "mongodb";

// GET - Fetch bookings for a user
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("carbo");
    
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');
    
    if (!clerkId) {
      return new Response(JSON.stringify({ error: "clerkId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const bookings = await db.collection("bookings")
      .find({ passengerClerkId: clerkId })
      .sort({ bookedAt: -1 })
      .toArray();
    
    return new Response(JSON.stringify(bookings), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error.message);
    return new Response(JSON.stringify({ error: "Failed to fetch bookings" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST - Create a new booking
export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("carbo");
    const data = await request.json();

    // Validate required fields
    if (!data.rideId || !data.passengerClerkId || !data.passengerName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if ride exists and has available seats
    const ride = await db.collection("rides").findOne({ _id: new ObjectId(data.rideId) });
    if (!ride) {
      return new Response(JSON.stringify({ error: "Ride not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if user already booked this ride
    const existingBooking = await db.collection("bookings").findOne({
      rideId: new ObjectId(data.rideId),
      passengerClerkId: data.passengerClerkId,
      status: "confirmed"
    });

    if (existingBooking) {
      return new Response(JSON.stringify({ error: "You have already booked this ride" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Count current bookings for this ride
    const currentBookings = await db.collection("bookings").countDocuments({
      rideId: new ObjectId(data.rideId),
      status: "confirmed"
    });

    if (currentBookings >= ride.seats) {
      return new Response(JSON.stringify({ error: "No seats available" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const newBooking = {
      rideId: new ObjectId(data.rideId),
      passengerClerkId: data.passengerClerkId,
      passengerName: data.passengerName,
      bookedAt: new Date(),
      status: "confirmed"
    };

    const result = await db.collection("bookings").insertOne(newBooking);
    
    return new Response(JSON.stringify({ 
      message: "Booking confirmed successfully", 
      bookingId: result.insertedId 
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating booking:", error.message);
    return new Response(JSON.stringify({ error: "Failed to create booking" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
