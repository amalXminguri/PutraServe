// src/handlers/facilities.js
import { ScanCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ddb } from "../lib/db.js";
import { json } from "../lib/response.js";

const T_FACILITIES = process.env.T_FACILITIES;
const T_FEEDBACK = process.env.T_FEEDBACK;

// Option A (public/CloudFront): set ASSET_BASE like:
// https://dxxxxx.cloudfront.net  OR  https://putraserve-assets-akmal.s3.ap-southeast-1.amazonaws.com
const ASSET_BASE = process.env.ASSET_BASE || "";

// Option B (private S3): set ASSET_BUCKET to your bucket name (e.g. putraserve-assets-akmal)
// Backend will return short-lived presigned URLs.
const ASSET_BUCKET = process.env.ASSET_BUCKET || "";
const s3 = ASSET_BUCKET ? new S3Client({}) : null;

// Encodes each path segment so keys with spaces work (e.g. "computer lab.jpg" -> "computer%20lab.jpg")
function encodeS3Key(key) {
  return String(key)
    .split("/")
    .map(encodeURIComponent)
    .join("/");
}

async function resolveImageUrl(keyOrUrl) {
  if (!keyOrUrl) return undefined;

  // if already a full url saved in DB
  if (/^https?:\/\//i.test(keyOrUrl)) return keyOrUrl;

  const cleanKey = String(keyOrUrl).replace(/^\//, "");

  // public/CDN mode
  if (ASSET_BASE) {
    const cleanBase = ASSET_BASE.replace(/\/$/, "");
    return `${cleanBase}/${encodeS3Key(cleanKey)}`;
  }

  // private S3 mode (presigned)
  if (s3 && ASSET_BUCKET) {
    return getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: ASSET_BUCKET, Key: cleanKey }),
      { expiresIn: 60 * 30 } // 30 minutes
    );
  }

  return undefined;
}

export async function listVenues() {
  const res = await ddb.send(
    new ScanCommand({
      TableName: T_FACILITIES,
    })
  );

  const items = res.Items || [];

  // pre-resolve image urls in parallel
  const enriched = await Promise.all(
    items.map(async (f) => {
      // ✅ Venue image source
      const venueKeyOrUrl = f.venueImageKey || f.venueImageUrl;

      // ✅ Facility image source:
      // If you didn't store imageKey/imageUrl, fallback to venue image
      const facilityKeyOrUrl = f.imageKey || f.imageUrl || venueKeyOrUrl;

      return {
        ...f,
        _imageUrl: await resolveImageUrl(facilityKeyOrUrl),
        _venueImageUrl: await resolveImageUrl(venueKeyOrUrl),
      };
    })
  );

  // group facilities by venueId
  const venueMap = new Map();

  for (const f of enriched) {
    const venueId = f.venueId || "venue-unknown";
    const venueName = f.venueName || "Unknown Venue";
    const location = f.location || "";

    if (!venueMap.has(venueId)) {
      venueMap.set(venueId, {
        id: venueId,
        name: venueName,
        location,
        imageUrl: f._venueImageUrl, // venue image
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
      imageUrl: f._imageUrl, // facility image (falls back to venue image)
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

  const f = res.Item;

  const venueKeyOrUrl = f.venueImageKey || f.venueImageUrl;
  const facilityKeyOrUrl = f.imageKey || f.imageUrl || venueKeyOrUrl;

  const imageUrl = await resolveImageUrl(facilityKeyOrUrl);
  const venueImageUrl = await resolveImageUrl(venueKeyOrUrl);

  return json(200, {
    ...f,
    id: f.facilityId, // frontend expects `id`
    imageUrl,         // facility image (fallbacks to venue image)
    venueImageUrl,    // venue image
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
