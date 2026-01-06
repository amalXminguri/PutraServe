import { QueryCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/db.js";
import { json, badRequest } from "../lib/response.js";

const T_TICKETS = process.env.T_TICKETS;

export async function listTickets(event) {
  const status = event.queryStringParameters?.status || "all";

  // MVP scan; later use GSI status-createdAt
  const res = await ddb.send(new ScanCommand({ TableName: T_TICKETS }));
  const items = (res.Items || []).filter((t) => status === "all" ? true : t.status === status);
  items.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  return json(200, items);
}

export async function updateTicketStatus(event) {
  const ticketId = event.pathParameters?.id;
  const body = JSON.parse(event.body || "{}");
  const status = body?.status;
  if (!status) return badRequest("Missing status");

  await ddb.send(new UpdateCommand({
    TableName: T_TICKETS,
    Key: { ticketId },
    UpdateExpression: "SET #s = :s",
    ExpressionAttributeNames: { "#s": "status" },
    ExpressionAttributeValues: { ":s": status },
  }));

  return json(200, { ok: true });
}
