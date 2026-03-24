import { ClientEvent } from "../../../eventsapi_schema/dolt/services/eventsapi/v1alpha1/client_event_pb";
import {
  ClientEventType,
  ClientEventTypeMap,
} from "../../../eventsapi_schema/dolt/services/eventsapi/v1alpha1/event_constants_pb";
import * as googleTS from "google-protobuf/google/protobuf/timestamp_pb";
import { v4 as randomUUID } from "uuid";
import { sendEvents } from "./eventsApi";

function createClientEvent(
  type: ClientEventTypeMap[keyof ClientEventTypeMap],
): ClientEvent {
  const now = new googleTS.Timestamp();
  now.fromDate(new Date());

  const event = new ClientEvent();
  event.setId(randomUUID());
  event.setType(type);
  event.setStartTime(now);
  event.setEndTime(now);
  return event;
}

export async function sendAppOpenedEvent(
  apiUrl: string,
  machineId: string,
): Promise<void> {
  const event = createClientEvent(ClientEventType.DOLT_WORKBENCH_APP_OPENED);
  await sendEvents(apiUrl, machineId, [event]);
}

export async function sendAgentConnectedEvent(
  apiUrl: string,
  machineId: string,
): Promise<void> {
  const event = createClientEvent(
    ClientEventType.DOLT_WORKBENCH_AGENT_CONNECTED,
  );
  await sendEvents(apiUrl, machineId, [event]);
}
