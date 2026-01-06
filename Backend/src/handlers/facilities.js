// src/handlers/facilities.js

import { ScanCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/db.js";
import { json } from "../lib/response.js";

const T_VENUES = process.env.T_VENUES;
const T_FACILITIES = process.env.T_FACILITIES;
const T_FEEDBACK = process.env.T_FEEDBACK;

/**
 * MVP: DEMO DATA (NO DB)
 * This makes the UI show venues again.
 */
export async function listVenues() {
  return {
    statusCode: 200,
    body: JSON.stringify([
      {
        id: "venue-1",
        name: "Pusat Sukan UPM",
        location: "UPM Serdang",
        facilities: [
          {
            id: "fac-1",
            name: "Badminton Court",
            category: "sports",
            capacity: 4
          },
          {
            id: "fac-2",
            name: "Futsal Court",
            category: "sports",
            capacity: 10
          }
        ]
      },
      {
        id: "venue-2",
        name: "Perpustakaan Sultan Abdul Samad",
        location: "UPM Serdang",
        facilities: [
          {
            id: "fac-3",
            name: "Discussion Room A",
            category: "study",
            capacity: 8
          }
        ]
      }
    ])
  };
}

/**
 * REAL DB (OPTIONAL – KEEP FOR LATER)
 */
export async function getFacility(event) {
  const id = event.pathParameters?.id;

  const venues = [
    {
      id: "venue-1",
      name: "Pusat Sukan UPM",
      location: "UPM Serdang",
      facilities: [
        { id: "fac-1", name: "Badminton Court", category: "sports", capacity: 4 },
        { id: "fac-2", name: "Futsal Court", category: "sports", capacity: 10 }
      ]
    },
    {
      id: "venue-2",
      name: "Perpustakaan Sultan Abdul Samad",
      location: "UPM Serdang",
      facilities: [
        { id: "fac-3", name: "Discussion Room A", category: "study", capacity: 8 }
      ]
    }
  ];

  for (const venue of venues) {
    const facility = venue.facilities.find(f => f.id === id);
    if (facility) {
      return json(200, {
        ...facility,
        venueId: venue.id,
        venueName: venue.name,
        location: venue.location
      });
    }
  }

  return json(404, { message: "Facility not found" });
}


/**
 * REAL DB (OPTIONAL – KEEP FOR LATER)
 */
export async function listFacilityFeedback(event) {
  const facilityId = event.pathParameters?.id;

  const res = await ddb.send(
    new QueryCommand({
      TableName: T_FEEDBACK,
      IndexName: "facilityId-createdAt",
      KeyConditionExpression: "facilityId = :f",
      ExpressionAttributeValues: {
        ":f": facilityId,
      },
      ScanIndexForward: false,
      Limit: 20,
    })
  );

  return json(200, res.Items || []);
}

/**
 * MVP: DEMO TIME SLOTS
 */
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
  ].map((time, i) => ({
    id: `slot-${i}`,
    time,
    available: true,
  }));

  return json(200, slots);
}
