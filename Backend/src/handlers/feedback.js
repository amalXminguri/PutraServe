import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/db.js";
import { json, badRequest } from "../lib/response.js";
import { v4 as uuid } from "uuid";

const T_FEEDBACK = process.env.T_FEEDBACK;
const T_TICKETS = process.env.T_TICKETS;
const T_BOOKINGS = process.env.T_BOOKINGS;

export async function createFeedback(event) {
  const body = JSON.parse(event.body || "{}");
  if (!body?.bookingId) return badRequest("Missing bookingId");
  if (!body?.rating) return badRequest("Missing rating");

  const feedback = {
    feedbackId: uuid(),
    createdAt: new Date().toISOString(),
    bookingId: body.bookingId,
    rating: body.rating,
    comment: body.comment || "",
    hasIssue: Boolean(body.hasIssue),
    issueDetails: body.hasIssue ? body.issueDetails : undefined,
  };

  // join facilityId for feedback index (easy querying on facility page)
  const b = await ddb.send(new GetCommand({ TableName: T_BOOKINGS, Key: { bookingId: body.bookingId } }));
  const booking = b.Item;
  if (!booking) return badRequest("Invalid bookingId");

  feedback.facilityId = booking.facilityId;
  feedback.userName = booking.userName;

  await ddb.send(new PutCommand({ TableName: T_FEEDBACK, Item: feedback }));

  // If hasIssue => create a maintenance ticket
  if (feedback.hasIssue && feedback.issueDetails) {
    const ticket = {
      ticketId: uuid(),
      createdAt: new Date().toISOString(),
      status: feedback.issueDetails.status || "open",
      userName: booking.userName,
      userEmail: booking.userEmail,
      facilityId: booking.facilityId,
      bookingId: booking.bookingId,
      issueDetails: feedback.issueDetails,
    };
    await ddb.send(new PutCommand({ TableName: T_TICKETS, Item: ticket }));
  }

  return json(201, feedback);
}
