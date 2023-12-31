import { createNamespace } from "@honeyjs/core/internal";
import { createEffect, createSignal } from "@honeyjs/core";

const events = createNamespace("router");

// TODO: Add more properties to location
const [location, setLocation] = createSignal(window.location);
const [path, setPath] = createSignal(location().pathname);

createEffect(() => {
  const _path = path();
  if (_path == window.location.pathname) return;
  history.pushState({}, "", _path);
  setLocation(window.location);
});

// HISTORY

let historyList = [window.location.pathname];
let historyIndex = 0;

/**
 * Gets the current location (non reactive)
 * @returns {string} The location in pathname format `/path/to/page`
 */
export const getLocation = () => historyList[historyIndex];
/**
 * @type {import("../types/index.d.ts").useLocation}
 */
export const useLocation = location;

/**
 * Navigates back one page (if possible) into history 
 */
export function back() {
  if (historyList.length == 1) return;
  historyIndex = Math.max(0, historyIndex - 1);
  const res = events.emit("back", {
    current: getLocation(),
    target: historyList[historyIndex],
    history: historyList
  }, true);
  if (res != false) setPath(historyList[historyIndex]);
}

/**
 * Navigates forward one page (if possible) in history
 */
export function forward() {
  historyIndex = Math.min(historyList.length - 1, historyIndex - 1);
  const res = events.emit("forward", {
    current: getLocation(),
    target: historyList[historyIndex],
    history: historyList
  }, true);
  if (res != false) setPath(historyList[historyIndex]);
}

/**
 * Navigates to the provided `targetPath`
 * @param {string} targetPath The location in pathname format `/path/to/page`
 */
export function navigate(targetPath) {
  if (targetPath == getLocation()) return;
  if (historyIndex < historyList.length - 1) {
    historyList.length = historyIndex + 1;
  }
  const res = events.emit("navigate", {
    current: getLocation(),
    target: targetPath,
    history: historyList
  }, true);

  if (res != false) {
    historyList.push(targetPath);
    historyIndex = historyList.length - 1;
    setPath(historyList[historyIndex]);
  };
}