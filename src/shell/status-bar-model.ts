import type { DeviceId, GameState } from "@/contracts/game-state";

export type StatusNetworkKind = "airplane" | "cellular" | "wifi" | "no-service";

export interface StatusBarModel {
  network: StatusNetworkKind;
  networkLabel: string;
  batteryLevel: number;
  lowBattery: boolean;
}

function numberFlag(state: GameState, key: string, fallback: number): number {
  const value=state.world.flags[key];
  return typeof value==="number"&&Number.isFinite(value)?value:fallback;
}

export function projectStatusBar(state: GameState, deviceId: DeviceId): StatusBarModel {
  const device=state.devices[deviceId];
  const override=state.world.flags[`ui.statusBar.${deviceId}.network`];
  const network:StatusNetworkKind=
    override==="airplane"||override==="cellular"||override==="wifi"||override==="no-service"
      ? override
      : device.networkMode==="simulated-online"
        ? "cellular"
        : device.networkMode==="local-only"
          ? "airplane"
          : "no-service";
  const batteryLevel=Math.max(1,Math.min(100,Math.round(numberFlag(state,`ui.statusBar.${deviceId}.battery`,78))));
  const lowBattery=batteryLevel<=20||state.world.flags[`ui.statusBar.${deviceId}.lowBattery`]===true;
  return {
    network,
    networkLabel: network==="cellular"?"5G":network==="wifi"?"Wi‑Fi":network==="no-service"?"无服务":"飞行模式",
    batteryLevel,
    lowBattery
  };
}
