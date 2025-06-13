import type { RequestHandler } from "./$types";
import {
  ENVOY_CLIENT_API_KEY,
  ENVOY_LOCATION_ID,
  ENVOY_FLOW_ID,
} from "$env/static/private";
import axios from "axios";

const headers = {
  "Content-Type": "application/json",
  "X-Api-Key": ENVOY_CLIENT_API_KEY,
};



export const POST: RequestHandler = async (request) => {
  const { fullName, maxVisitTime } = await request.request.json();
  const entry = {
    locationId: ENVOY_LOCATION_ID,
    flowId: ENVOY_FLOW_ID,
    fullName,
    customFields: [
      {
        field: "maxVisitTime",
        value: maxVisitTime.toString(),
      },
      {
        field: "test",
        value: "visitor",
      },
    ],
  };

  const response = await axios.post(
    "https://api.envoy.com/v1/entries",
    { entry },
    { headers }
  );

  return new Response(JSON.stringify(response.data));
};
