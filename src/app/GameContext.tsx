import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DeviceId, GameState, JsonValue } from "@/contracts/game-state";
import type { EventReceipt, StoryEvent } from "@/contracts/story-event";
import { triggers } from "@/content/content-pack";
import { createInitialGameState } from "@/engine/initial-state";
import { createStoryEvent } from "@/engine/event-factory";
import { processStoryEvent } from "@/engine/story-engine";
import { clearSave, commitSave, loadSave } from "@/persistence/save-service";

interface GameContextValue {
  state: GameState;
  ready: boolean;
  activeDeviceId: DeviceId;
  switchDevice(id: DeviceId): void;
  openApp(appId: string): void;
  closeApp(): void;
  navigate(route: string): void;
  goBack(): void;
  submitPasscode(code: string): boolean;
  emit(type: string, targetId?: string, payload?: JsonValue): void;
  setUiFlag(key: string, value: JsonValue): void;
  reset(): Promise<void>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({children}:{children:ReactNode}) {
  const [state,setState] = useState<GameState>(() => createInitialGameState());
  const [journal,setJournal] = useState<StoryEvent[]>([]);
  const [receipts,setReceipts] = useState<EventReceipt[]>([]);
  const [ready,setReady] = useState(false);

  useEffect(() => { void loadSave().then((save) => { if (save) { setState(save.snapshot); setJournal(save.journal); setReceipts(save.receipts); } setReady(true); }); }, []);
  useEffect(() => { if (ready) void commitSave(state,journal,receipts); }, [state,journal,receipts,ready]);

  const activeDeviceId = (state.world.flags.activeDeviceId === "investigation" ? "investigation" : "player") as DeviceId;
  const mutate = useCallback((fn:(draft:GameState)=>void) => setState((current) => { const draft=structuredClone(current); fn(draft); draft.revision += 1; return draft; }), []);

  const emit = useCallback((type:string,targetId?:string,payload:JsonValue={}) => {
    const event = createStoryEvent({type,deviceId:activeDeviceId,sceneId:state.story.currentSceneId,actorId:"actor.player",targetId,payload});
    const result = processStoryEvent(state,journal,receipts,event,triggers);
    setState(result.state); setJournal(result.journal); setReceipts(result.receipts);
  }, [activeDeviceId,state,journal,receipts]);

  const value = useMemo<GameContextValue>(() => ({
    state, ready, activeDeviceId,
    switchDevice(id) {
      if (id === "player" && activeDeviceId !== "player" && state.story.completedSceneIds.includes("A3-08") && !state.story.completedSceneIds.includes("A3-09")) {
        const event = createStoryEvent({
          type: "device.player.anchor_change.viewed",
          deviceId: "player",
          sceneId: state.story.currentSceneId,
          actorId: "actor.player",
          targetId: "player.sync",
          payload: { deviceTransition: "investigation-to-player" }
        });
        const result = processStoryEvent(state,journal,receipts,event,triggers);
        const nextState = structuredClone(result.state);
        nextState.world.flags.activeDeviceId = id;
        nextState.revision += 1;
        setState(nextState); setJournal(result.journal); setReceipts(result.receipts);
        return;
      }
      mutate((draft) => { draft.world.flags.activeDeviceId = id; });
    },
    openApp(appId) { mutate((draft) => { const d=draft.devices[activeDeviceId]; d.activeAppId=appId; d.appStack=["root"]; d.unreadByApp[appId]=0; }); },
    closeApp() { mutate((draft) => { const d=draft.devices[activeDeviceId]; d.activeAppId=null; d.appStack=[]; }); },
    navigate(route) { mutate((draft) => { draft.devices[activeDeviceId].appStack.push(route); }); },
    goBack() { mutate((draft) => { const d=draft.devices[activeDeviceId]; if (d.appStack.length>1) d.appStack.pop(); else { d.activeAppId=null; d.appStack=[]; } }); },
    submitPasscode(code) {
      if (code === "230917") {
        const event = createStoryEvent({
          type: "device.passcode.accepted",
          deviceId: "investigation",
          sceneId: state.story.currentSceneId,
          actorId: "actor.player",
          targetId: "investigation",
          payload: { method: "manual" }
        });
        const result = processStoryEvent(state,journal,receipts,event,triggers);
        const nextState = structuredClone(result.state);
        const unlocked = nextState.story.completedSceneIds.includes("P03") && nextState.devices.investigation.locked === false;
        if (unlocked) {
          nextState.devices.investigation.activeAppId = null;
          nextState.devices.investigation.appStack = [];
        } else {
          nextState.world.flags.passcodeFailures = Number(nextState.world.flags.passcodeFailures ?? 0) + 1;
          nextState.revision += 1;
        }
        setState(nextState);
        setJournal(result.journal);
        setReceipts(result.receipts);
        return unlocked;
      }
      mutate((draft) => { draft.world.flags.passcodeFailures = Number(draft.world.flags.passcodeFailures ?? 0)+1; }); return false;
    },
    emit,
    setUiFlag(key,value) { mutate((draft) => { draft.world.flags[`ui.${key}`]=value; }); },
    async reset() { await clearSave(); const fresh=createInitialGameState(); setState(fresh); setJournal([]); setReceipts([]); }
  }), [state,ready,activeDeviceId,mutate,emit]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue { const ctx=useContext(GameContext); if(!ctx) throw new Error("useGame must be used within GameProvider"); return ctx; }
