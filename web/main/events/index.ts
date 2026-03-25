import { machineIdSync } from "node-machine-id";
import {
  sendAppOpenedEvent as _sendAppOpenedEvent,
  sendAgentConnectedEvent as _sendAgentConnectedEvent,
} from "./events";

const PRODUCTION_EVENTS_URL = "https://eventsapi.dolthub.com";
const isProd = process.env.NODE_ENV === "production";
const eventsApiUrl = isProd
  ? PRODUCTION_EVENTS_URL
  : process.env.EVENTS_GRPC_URL;
let machineId: string | undefined;

function getMachineId(): string {
  if (!machineId) {
    machineId = machineIdSync();
  }
  return machineId;
}

export function initEvents(): void {
  if (!eventsApiUrl) {
    console.log("EVENTS_GRPC_URL not set, skipping events");
    return;
  }
  _sendAppOpenedEvent(eventsApiUrl, getMachineId()).catch(err =>
    console.error("Failed to send app opened event:", err),
  );
}

export function sendAgentConnectedEvent(): void {
  if (!eventsApiUrl) return;
  _sendAgentConnectedEvent(eventsApiUrl, getMachineId()).catch(err =>
    console.error("Failed to send agent connected event:", err),
  );
}
