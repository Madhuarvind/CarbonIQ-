export const dynamic = "force-static";

import clientPromise from "../../../dbConnect";
import { ObjectId } from "mongodb";

// GET - Fetch all rides
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("carbo");
    
    const rides = await db.collection("rides").find({}).sort({ createdAt: -1 }).toArray();
    
    return new Response(JSON.stringify(rides), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching rides:", error.message);
    return new Response(JSON.stringify({ error: "Failed to fetch rides" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST - Create a new ride
export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("carbo");
    const data = await request.json();

    // Validate required fields
    if (!data.driver || !data.driverClerkId || !data.start || !data.end || !data.car || !data.seats) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const newRide = {
      driver: data.driver,
      driverClerkId: data.driverClerkId,
      start: data.start,
      end: data.end,
      car: data.car,
      seats: parseInt(data.seats),
      distance: data.distance || "",
      pickupPoint: data.pickupPoint || "",
      rating: data.rating || 0,
      image: data.image || "/api/placeholder/40/40",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("rides").insertOne(newRide);
    
    return new Response(JSON.stringify({ 
      message: "Ride created successfully", 
      rideId: result.insertedId 
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating ride:", error.message);
    return new Response(JSON.stringify({ error: "Failed to create ride" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
