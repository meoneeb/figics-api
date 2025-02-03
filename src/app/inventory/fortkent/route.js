import { NextResponse } from "next/server";

const baseUrl = "https://api.cardog.com";
const appKey = "5U4AQ6ZBS2KHKJHI1ZTLSO04K6IT9CDT";
const apiKey = "5SMB0WTFKLTRUKT5DXY7PP09P8UERJ9U";
const rooftopID = "475";

export async function GET() {
  try {
    // Step 1: Login to get Token
    const loginResponse = await fetch(`${baseUrl}/api/Login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({ appKey, apiKey }),
    });

    if (!loginResponse.ok) {
      return new NextResponse(`<error><message>Authentication failed</message></error>`, {
        status: 401,
        headers: { "Content-Type": "application/xml" },
      });
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    if (!token) {
      return new NextResponse(`<error><message>Token not received</message></error>`, {
        status: 401,
        headers: { "Content-Type": "application/xml" },
      });
    }

    // Step 2: Fetch Inventory
    const inventoryResponse = await fetch(
      `${baseUrl}/api/Inventory?includeAllImageUrls=true`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          RooftopID: rooftopID,
        },
      }
    );

    if (!inventoryResponse.ok) {
      return new NextResponse(`<error><message>Error fetching inventory</message></error>`, {
        status: 400,
        headers: { "Content-Type": "application/xml" },
      });
    }

    const inventoryData = await inventoryResponse.json();
    const xmlData = convertToXML(inventoryData);

    return new NextResponse(xmlData, {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    console.error("Server Error:", error);
    return new NextResponse(`<error><message>Server error</message></error>`, {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}
function escapeXML(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function convertToXML(data) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<inventory>\n';

  if (data.vehicleList && Array.isArray(data.vehicleList)) {
    data.vehicleList.forEach((vehicle) => {
      xml += "  <vehicle>\n";
      [
        "inventoryID",
        "invID",
        "vin",
        "stockNumber",
        "stockNo",
        "vehicleType",
        "segment",
        "stockType",
        "year",
        "make",
        "model",
        "series",
        "style",
        "odometer",
        "exteriorColor",
        "transmission",
        "status",
        "isAvailable",
        "askingPrice",
        "imageUrls",
        "priorRental",
        "isExcludedFromExports",
        "displayName",
        "imageUrl",
        "imageCount",
        "daysInStock",
        "age",
        "isDealerCertified",
        "isWholesale",
        "webLeads",
        "quotes",
        "demos",
        "carfaxEnabled",
      ].forEach((key) => {
        xml += `    <${key}>${escapeXML(vehicle[key] || "")}</${key}>\n`;
      });

      xml += "  </vehicle>\n";
    });
  }

  xml += "</inventory>";
  return xml;
}
