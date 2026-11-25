'use client';

import { useEffect, useRef, useCallback, useId } from 'react';

interface StackEntry {
  id: string;
  enableEscape: boolean;
  onDismiss: () => void;
  closedByPopstate: boolean;
}

const dismissStack: StackEntry[] = [];
let globalListenersAttached = false;
let nextOverlaySeq = 0;

function handleGlobalKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || dismissStack.length === 0) return;

  const topEntry = dismissStack[dismissStack.length - 1];
  if (!topEntry || !topEntry.enableEscape) return;

  event.preventDefault();
  event.stopPropagation();
  topEntry.onDismiss();
}

function handleGlobalPopState() {
  if (dismissStack.length === 0) return;

  const topEntry = dismissStack.pop();
  if (!topEntry) return;

  topEntry.closedByPopstate = true;
  topEntry.onDismiss();
}

function ensureGlobalListeners() {
  if (globalListenersAttached || typeof window === 'undefined') return;
  window.addEventListener('keydown', handleGlobalKeyDown, true);
  window.addEventListener('popstate', handleGlobalPopState);
  globalListenersAttached = true;
}

function cleanupGlobalListenersIfEmpty() {
  if (!globalListenersAttached || dismissStack.length > 0 || typeof window === 'undefined') return;
  window.removeEventListener('keydown', handleGlobalKeyDown, true);
  window.removeEventListener('popstate', handleGlobalPopState);
  globalListenersAttached = false;
}

function removeEntryFromStack(entryId: string): StackEntry | undefined {
  const index = dismissStack.findIndex((item) => item.id === entryId);
  if (index === -1) return undefined;
  const [removed] = dismissStack.splice(index, 1);
  cleanupGlobalListenersIfEmpty();
  return removed;
}

export interface UseOverlayDismissOptions {
  isOpen: boolean;
  onClose: () => void;
  enableEscape?: boolean;
  enableHistory?: boolean;
}

/**
 * Registers an active modal, drawer, or in-page subview on a unified LIFO stack
 * so Escape key and browser Back (popstate) close only the topmost layer.
 */
export function useOverlayDismiss({
  isOpen,
  onClose,
  enableEscape = true,
  enableHistory = true,
}: UseOverlayDismissOptions): void {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    const entryId = `hippo-ov-${++nextOverlaySeq}`;
    const entry: StackEntry = {
      id: entryId,
      enableEscape,
      closedByPopstate: false,
      onDismiss: () => onCloseRef.current(),
    };

    ensureGlobalListeners();
    dismissStack.push(entry);

    if (enableHistory) {
      try {
        const currentState =
          window.history.state && typeof window.history.state === 'object'
            ? window.history.state
            : {};
        window.history.pushState({ ...currentState, __hippoOverlayId: entryId }, '');
      } catch {
        // Ignore SecurityError in restricted browser environments
      }
    }

    return () => {
      removeEntryFromStack(entryId);
      if (
        enableHistory &&
        !entry.closedByPopstate &&
        typeof window !== 'undefined' &&
        window.history.state &&
        typeof window.history.state === 'object' &&
        (window.history.state as { __hippoOverlayId?: string }).__hippoOverlayId === entryId
      ) {
        try {
          window.history.back();
        } catch {
          // Ignore navigation errors during teardown
        }
      }
    };
  }, [isOpen, enableEscape, enableHistory]);
}

/**
 * Syncs local tab transitions with browser Back history using the shared LIFO stack,
 * without triggering Escape closes or interfering with route navigation.
 */
export function useTabBackHistory<T extends string>(
  activeTab: T,
  setActiveTab: (tab: T) => void
): (nextTab: T) => void {
  const instanceId = useId();
  const activeTabRef = useRef(activeTab);
  const setActiveTabRef = useRef(setActiveTab);
  const pushedIdsRef = useRef<string[]>([]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    setActiveTabRef.current = setActiveTab;
  }, [setActiveTab]);

  useEffect(() => {
    const pushedIds = pushedIdsRef.current;
    return () => {
      for (const id of pushedIds) {
        removeEntryFromStack(id);
      }
      pushedIds.length = 0;
    };
  }, []);

  return useCallback(
    (nextTab: T) => {
      const previousTab = activeTabRef.current;
      if (nextTab === previousTab) return;

      setActiveTabRef.current(nextTab);

      if (typeof window === 'undefined') return;

      const entryId = `hippo-tab-${instanceId}-${++nextOverlaySeq}`;
      const entry: StackEntry = {
        id: entryId,
        enableEscape: false,
        closedByPopstate: false,
        onDismiss: () => {
          const idx = pushedIdsRef.current.indexOf(entryId);
          if (idx !== -1) pushedIdsRef.current.splice(idx, 1);
          setActiveTabRef.current(previousTab);
        },
      };

      ensureGlobalListeners();
      dismissStack.push(entry);
      pushedIdsRef.current.push(entryId);

      try {
        const currentState =
          window.history.state && typeof window.history.state === 'object'
            ? window.history.state
            : {};
        window.history.pushState({ ...currentState, __hippoOverlayId: entryId }, '');
      } catch {
        // Ignore restricted history API calls
      }
    },
    [instanceId]
  );
}
