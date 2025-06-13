import { ENVOY_CLIENT_API_KEY } from "$env/static/private";
import axios from "axios";
import type { RequestHandler } from "./$types";

type SignInEntry = {
  id: string;
  fullName: string;
  signedInAt: string;
  signedOutAt: string;
  maxVisitTime: number;
  exceededVisitTime: boolean;
};

const headers = {
  "Content-Type": "application/json",
  "X-Api-Key": ENVOY_CLIENT_API_KEY,
};

export const GET: RequestHandler = async () => {
  const response = await axios.get("https://api.envoy.com/v1/entries", {
    headers,
  });
  const data = await response.data.data;
  const parsed = parseEntries(data);
  return new Response(JSON.stringify(parsed));
};

export const POST: RequestHandler = async (request) => {
  const { id } = await request.request.json();
  const signedOutAt = new Date().toISOString();
  const entry = {
    signedOutAt,
  };
  const response = await axios.post(
    `https://api.envoy.com/v1/entries/${id}`,
    {entry},
    { headers }
  );
  return new Response(JSON.stringify(response.data));
};

const parseEntries = (entries: any): SignInEntry[] => {
  return entries
    .filter(
      (entry: any) =>
        entry.customFields.length > 0 &&
        entry.customFields.some(
          (field: any) => field.field === "maxVisitTime" && field.value !== null
        )
    )
    .map((entry: any) => {
      const maxVisitTime = Number(
        entry.customFields.find((field: any) => field.field === "maxVisitTime")
          ?.value
      );
      const signedInAtDate = new Date(entry.signedInAt);
      const expiryDate = new Date(
        signedInAtDate.getTime() + maxVisitTime * 60000
      );
      const exceededVisitTime = expiryDate < new Date();
      return {
        id: entry.id,
        fullName: entry.fullName,
        signedInAt: signedInAtDate.toLocaleString(),
        signedOutAt: entry.signedOutAt
          ? new Date(entry.signedOutAt).toLocaleString()
          : null,
        maxVisitTime,
        exceededVisitTime,
      };
    })
    .slice(0, 10);
};
