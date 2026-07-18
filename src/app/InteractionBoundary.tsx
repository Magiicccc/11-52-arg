import { useCallback, useEffect, useRef, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { useGame } from "./GameContext";

const interactiveSelector = "button, a[href], input, textarea, select, [role='button'], [tabindex]";

function normalizeToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fff_.:-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function hash(value: string): string {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(36);
}

function structuralPath(element: Element, boundary: Element): string {
  const segments: string[] = [];
  let current: Element | null = element;
  while (current && current !== boundary) {
    const parent: Element | null = current.parentElement;
    const siblings = parent ? [...parent.children].filter((candidate) => candidate.tagName === current?.tagName) : [];
    const position = Math.max(0, siblings.indexOf(current)) + 1;
    const classToken = [...current.classList].slice(0, 2).map(normalizeToken).filter(Boolean).join(".");
    segments.unshift(`${current.tagName.toLowerCase()}${classToken ? `.${classToken}` : ""}:nth-${position}`);
    current = parent;
  }
  return segments.join(">");
}

function assignInteractionId(element: HTMLElement, boundary: HTMLElement): void {
  if (element.dataset.interactionId) return;
  const scopeElement = element.closest<HTMLElement>("[data-app-id], [data-screen-id]");
  const scope = scopeElement?.dataset.appId ?? scopeElement?.dataset.screenId ?? "game";
  const semantic = element.dataset.testid
    ?? element.getAttribute("aria-label")
    ?? element.getAttribute("name")
    ?? element.getAttribute("placeholder")
    ?? element.textContent
    ?? element.tagName;
  const token = normalizeToken(semantic) || element.tagName.toLowerCase();
  const path = structuralPath(element, scopeElement ?? boundary);
  element.dataset.interactionId = `${scope}:${token}:${hash(path)}`;
  if (!element.dataset.interactionState) {
    element.dataset.interactionState = element.matches(":disabled") ? "disabled" : "works";
  }
}

function interactiveTarget(target: EventTarget | null): HTMLElement | null {
  return target instanceof Element ? target.closest<HTMLElement>(interactiveSelector) : null;
}

export function InteractionBoundary({ children }: { children: ReactNode }) {
  const boundaryRef = useRef<HTMLDivElement>(null);
  const { activeDeviceId, state, emit } = useGame();

  const hydrate = useCallback(() => {
    const boundary = boundaryRef.current;
    if (!boundary) return;
    boundary.querySelectorAll<HTMLElement>(interactiveSelector).forEach((element) => assignInteractionId(element, boundary));
  }, []);

  useEffect(() => {
    hydrate();
    const boundary = boundaryRef.current;
    if (!boundary) return;
    const observer = new MutationObserver(hydrate);
    observer.observe(boundary, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled"] });
    return () => observer.disconnect();
  }, [hydrate]);

  const record = useCallback((element: HTMLElement, type: "activated" | "input") => {
    const boundary = boundaryRef.current;
    if (!boundary) return;
    assignInteractionId(element, boundary);
    const appId = element.closest<HTMLElement>("[data-app-id]")?.dataset.appId ?? null;
    emit(
      type === "activated" ? "ui.interaction.activated" : "ui.interaction.input",
      element.dataset.interactionId,
      {
        interactionId: element.dataset.interactionId ?? "unknown",
        interactionState: element.dataset.interactionState ?? "works",
        appId,
        deviceId: activeDeviceId,
        route: state.devices[activeDeviceId].appStack.at(-1) ?? "home",
        source: "P"
      }
    );
  }, [activeDeviceId, emit, state.devices]);

  return <div
    className="interaction-boundary"
    ref={boundaryRef}
    onClickCapture={(event: MouseEvent<HTMLDivElement>) => {
      const element = interactiveTarget(event.target);
      if (element && !element.matches(":disabled")) {
        queueMicrotask(() => record(element, "activated"));
      }
    }}
    onInputCapture={(_event: FormEvent<HTMLDivElement>) => {
      // Text entry is represented by the form's canonical submit/send event.
      // Dispatching a GameState event on every keystroke would reconcile a
      // controlled field while the native input event is still in flight.
    }}
  >
    {children}
  </div>;
}
