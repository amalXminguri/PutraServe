// src/handlers/facilities.js
import { ScanCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/db.js";
import { json } from "../lib/response.js";

const T_FACILITIES = process.env.T_FACILITIES;
const T_FEEDBACK = process.env.T_FEEDBACK;

export async function listVenues() {
  const res = await ddb.send(
    new ScanCommand({
      TableName: T_FACILITIES,
    })
  );

  const items = res.Items || [];

  // group facilities by venueId
  const venueMap = new Map();

  for (const f of items) {
    const venueId = f.venueId || "venue-unknown";
    const venueName = f.venueName || "Unknown Venue";
    const location = f.location || "";

    if (!venueMap.has(venueId)) {
      venueMap.set(venueId, {
        id: venueId,
        name: venueName,
        location,
        facilities: [],
      });
    }

    venueMap.get(venueId).facilities.push({
      id: f.facilityId, // frontend expects `id`
      name: f.name,
      category: f.category,
      capacity: f.capacity,
      price: f.price,
      ratingAvg: f.ratingAvg,
      totalReviews: f.totalReviews,
    });
  }

  return json(200, Array.from(venueMap.values()));
}

export async function getFacility(event) {
  const id = event.pathParameters?.id;

  const res = await ddb.send(
    new GetCommand({
      TableName: T_FACILITIES,
      Key: { facilityId: id },
    })
  );

  if (!res.Item) return json(404, { message: "Facility not found" });

  // IMPORTANT: frontend expects `id`, but DB key is `facilityId`
  const f = res.Item;
  return json(200, {
    id: f.facilityId,
    ...f,
  });
}

export async function listFacilityFeedback(event) {
  const facilityId = event.pathParameters?.id;

  const res = await ddb.send(
    new QueryCommand({
      TableName: T_FEEDBACK,
      IndexName: "facilityId-createdAt",
      KeyConditionExpression: "facilityId = :f",
      ExpressionAttributeValues: { ":f": facilityId },
      ScanIndexForward: false,
      Limit: 20,
    })
  );

  return json(200, res.Items || []);
}

export async function getTimeSlots() {
  const slots = [
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
    "20:00 - 21:00",
  ].map((time, i) => ({ id: `slot-${i}`, time, available: true }));

  return json(200, slots);
}
