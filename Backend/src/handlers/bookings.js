import { PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/db.js";
import { json, badRequest } from "../lib/response.js";
import { v4 as uuid } from "uuid";

const T_BOOKINGS = process.env.T_BOOKINGS;

export async function createBooking(event) {
  const body = JSON.parse(event.body || "{}");
  const required = ["userId","facilityId","date","timeSlot","userName","userEmail"];
  for (const k of required) if (!body?.[k]) return badRequest(`Missing ${k}`);

  const booking = {
    bookingId: uuid(),
    createdAt: new Date().toISOString(),
    status: "upcoming",
    ...body,
  };

  await ddb.send(new PutCommand({ TableName: T_BOOKINGS, Item: booking }));
  return json(201, booking);
}

export async function listBookings(event) {
  const userId = event.queryStringParameters?.userId;
  if (!userId) return badRequest("Missing userId");

  const res = await ddb.send(new QueryCommand({
    TableName: T_BOOKINGS,
    IndexName: "userId-createdAt",
    KeyConditionExpression: "userId = :u",
    ExpressionAttributeValues: { ":u": userId },
    ScanIndexForward: false,
  }));

  return json(200, res.Items || []);
}

export async function getBooking(event) {
  const bookingId = event.pathParameters?.id;
  const res = await ddb.send(new GetCommand({
    TableName: T_BOOKINGS,
    Key: { bookingId },
  }));
  if (!res.Item) return json(404, { message: "Booking not found" });
  return json(200, res.Item);
}
