import { describe, expect, it } from "vitest";
import { createInitialGameState } from "@/engine/initial-state";
import { projectStatusBar } from "@/shell/status-bar-model";

describe("status bar GameState projection",()=>{
  it("projects the two default device network states consistently",()=>{
    const state=createInitialGameState();
    expect(projectStatusBar(state,"player")).toMatchInlineSnapshot(`
      {
        "batteryLevel": 78,
        "lowBattery": false,
        "network": "cellular",
        "networkLabel": "5G",
      }
    `);
    expect(projectStatusBar(state,"investigation")).toMatchInlineSnapshot(`
      {
        "batteryLevel": 78,
        "lowBattery": false,
        "network": "airplane",
        "networkLabel": "飞行模式",
      }
    `);
  });

  it("supports Wi-Fi, no service and low battery without changing device semantics",()=>{
    const state=createInitialGameState();
    state.world.flags["ui.statusBar.player.network"]="wifi";
    state.world.flags["ui.statusBar.player.battery"]=14;
    expect(projectStatusBar(state,"player")).toEqual({
      network:"wifi",
      networkLabel:"Wi‑Fi",
      batteryLevel:14,
      lowBattery:true
    });
    state.world.flags["ui.statusBar.player.network"]="no-service";
    state.world.flags["ui.statusBar.player.battery"]=64;
    expect(projectStatusBar(state,"player")).toEqual({
      network:"no-service",
      networkLabel:"无服务",
      batteryLevel:64,
      lowBattery:false
    });
  });
});
