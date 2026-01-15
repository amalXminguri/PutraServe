import { PutCommand, GetCommand, QueryCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/db.js";
import { json, badRequest } from "../lib/response.js";
import { v4 as uuid } from "uuid";

const T_BOOKINGS = process.env.T_BOOKINGS;

// helper: build ISO datetime from date + timeslot end
function computeEndDateTime(date, timeSlot) {
  // timeSlot expected: "12:00 - 13:00"
  const end = (timeSlot || "").split(" - ")[1];
  if (!date || !end) return null;

  // If you want Malaysia time strictly, we can improve later.
  // This works fine for MVP:
  return new Date(`${date}T${end}:00`).toISOString();
}

export async function createBooking(event) {
  const body = JSON.parse(event.body || "{}");
  const required = ["userId", "facilityId", "date", "timeSlot", "userName", "userEmail"];
  for (const k of required) if (!body?.[k]) return badRequest(`Missing ${k}`);

  const endDateTime = computeEndDateTime(body.date, body.timeSlot);

  const booking = {
    bookingId: uuid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "upcoming",
    endDateTime, // ✅ used for auto-complete cron
    ...body,
  };

  await ddb.send(new PutCommand({ TableName: T_BOOKINGS, Item: booking }));
  return json(201, booking);
}

export async function listBookings(event) {
  const userId = event.queryStringParameters?.userId;
  if (!userId) return badRequest("Missing userId");

  const res = await ddb.send(
    new QueryCommand({
      TableName: T_BOOKINGS,
      IndexName: "userId-createdAt",
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: { ":u": userId },
      ScanIndexForward: false,
    })
  );

  return json(200, res.Items || []);
}

export async function getBooking(event) {
  const bookingId = event.pathParameters?.id;
  if (!bookingId) return badRequest("Missing bookingId");

  const res = await ddb.send(
    new GetCommand({
      TableName: T_BOOKINGS,
      Key: { bookingId },
    })
  );

  if (!res.Item) return json(404, { message: "Booking not found" });
  return json(200, res.Item);
}

/**
 * ✅ PUT /bookings/{id}/status
 * body: { "status": "completed" | "upcoming" | "cancelled" }
 */
export async function updateBookingStatus(event) {
  const bookingId = event.pathParameters?.id;
  if (!bookingId) return badRequest("Missing bookingId");

  const body = JSON.parse(event.body || "{}");
  const status = body.status;

  const allowed = new Set(["upcoming", "completed", "cancelled"]);
  if (!allowed.has(status)) return badRequest("Invalid status");

  await ddb.send(
    new UpdateCommand({
      TableName: T_BOOKINGS,
      Key: { bookingId },
      UpdateExpression: "SET #s = :s, updatedAt = :u",
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: {
        ":s": status,
        ":u": new Date().toISOString(),
      },
    })
  );

  return json(200, { bookingId, status });
}

/**
 * ✅ CRON (EventBridge schedule)
 * Auto mark bookings as completed when endDateTime < now
 */
export async function autoCompleteBookings() {
  const now = new Date().toISOString();

  // MVP uses Scan. For big scale, we can add a GSI later.
  const res = await ddb.send(
    new ScanCommand({
      TableName: T_BOOKINGS,
      FilterExpression:
        "#s = :up AND attribute_exists(endDateTime) AND endDateTime < :now",
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: {
        ":up": "upcoming",
        ":now": now,
      },
    })
  );

  const items = res.Items || [];

  for (const b of items) {
    await ddb.send(
      new UpdateCommand({
        TableName: T_BOOKINGS,
        Key: { bookingId: b.bookingId },
        UpdateExpression: "SET #s = :done, updatedAt = :u",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: {
          ":done": "completed",
          ":u": new Date().toISOString(),
        },
      })
    );
  }

  return json(200, { updated: items.length });
}
