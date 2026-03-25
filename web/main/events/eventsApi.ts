import { grpc } from "@improbable-eng/grpc-web";
import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport";
import {
  ClientEvent,
  LogEventsRequest,
  LogEventsResponse,
} from "@eventsapi_schema/dolt/services/eventsapi/v1alpha1/client_event_pb";
import {
  ClientEventsServiceClient,
  ServiceError,
} from "@eventsapi_schema/dolt/services/eventsapi/v1alpha1/client_event_pb_service";
import {
  AppID,
  Platform,
  PlatformMap,
} from "@eventsapi_schema/dolt/services/eventsapi/v1alpha1/event_constants_pb";
import { app } from "electron";

function getPlatform(): PlatformMap[keyof PlatformMap] {
  switch (process.platform) {
    case "darwin":
      return Platform.DARWIN;
    case "win32":
      return Platform.WINDOWS;
    case "linux":
      return Platform.LINUX;
    default:
      return Platform.PLATFORM_UNSPECIFIED;
  }
}

function getVersion(): string {
  return app.getVersion();
}

async function logEvents(
  client: ClientEventsServiceClient,
  req: LogEventsRequest,
): Promise<LogEventsResponse> {
  return new Promise((resolve, reject) => {
    client.logEvents(
      req,
      new grpc.Metadata(),
      (err: ServiceError | null, res: LogEventsResponse | null) => {
        if (err) {
          reject(err);
        } else if (!res) {
          reject(new Error("server returned no data"));
        } else {
          resolve(res);
        }
      },
    );
  });
}

export async function sendEvents(
  apiUrl: string,
  machineId: string,
  events: ClientEvent[],
): Promise<void> {
  const client = new ClientEventsServiceClient(apiUrl, {
    transport: NodeHttpTransport(),
  });

  const req = new LogEventsRequest();
  req.setMachineId(machineId);
  req.setVersion(getVersion());
  req.setPlatform(getPlatform());
  req.setApp(AppID.APP_DOLT_WORKBENCH);
  req.setExtra("");
  req.setEventsList(events);

  await logEvents(client, req);
}
