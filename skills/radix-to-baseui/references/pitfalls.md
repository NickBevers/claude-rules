# Pitfalls — Real Bugs from Production Migration

## 1. Missing Positioner

Popup renders at wrong position or doesn't appear. Always wrap Popup in Positioner for Popover, Menu, Tooltip, Select.

## 2. z-index on Popup instead of Positioner

Stacking issues with AG Grid or other overlays. z-index goes on Positioner, not Popup. Putting it on both is redundant and confusing.

## 3. Silently dropped callbacks

`onInteractOutside`, `onEscapeKeyDown`, `onOpenAutoFocus`, `onCloseAutoFocus` can be accepted by TypeScript (via rest spread `...props`) but do nothing. The component appears to work but dismiss prevention is gone. This is the #1 data-loss risk.

Replace with: `disablePointerDismissal`, `preventEscapeKeyDown` (via `onOpenChange` reason filtering), `initialFocus`, `finalFocus`.

## 4. HoverCard delay props dropped

`openDelay`/`closeDelay` on Popover Root do nothing. In Base UI, these go on **Trigger** with `openOnHover`. If your wrapper accepts delays on Root (like Radix HoverCard), pass them to Trigger via React context.

## 5. Synthetic Event shim in initialFocus

Using `new Event()` + `Object.defineProperty` to fake Radix's `onOpenAutoFocus` callback is expensive (2 Event objects + multiple defineProperty calls per open/close). Use the lightweight `createPreventableEvent` helper (plain object with `defaultPrevented` + `preventDefault()`) or native `initialFocus` API directly.

## 6. Unstable initialFocus/finalFocus closures

Inline arrow functions in `initialFocus`/`finalFocus` cause Base UI to re-evaluate focus config on every render. Wrap in `useCallback`:

```tsx
const handleInitialFocus = useCallback(() => { ... }, [onOpenAutoFocus]);
<Popup initialFocus={onOpenAutoFocus ? handleInitialFocus : undefined} />
```

## 7. Context value not memoized

Wrapping Base UI components in context providers (e.g., TabsContext, InlineTabsContext) with inline value objects causes cascading re-renders through all consumers. Always `useMemo` the context value and `useCallback` handler functions.

## 8. Sheet modal={false} is intentional

Sheets containing nested overlays (selects, comboboxes, popovers) need `modal={false}` to avoid focus trap conflicts. With `modal={true}`, focus trapping prevents interaction with portaled popover content inside the sheet. Don't "fix" this to `true`.

## 9. Drawer/vaul still uses data-[state=]

If your project uses `vaul` for drawers alongside Base UI, vaul still outputs `data-state="open/closed"`. Don't migrate those selectors — they correctly match vaul's output.

## 10. Tabs data-active vs data-selected

Base UI Tabs uses `data-selected` internally for the active tab. If your app sets custom `data-active` via application code, keep it. Just don't expect Radix's `data-[state=active]` to work — it needs to be either `data-selected` (Base UI) or `data-active` (manual).

## 11. getBoundingClientRect in handlers

Synchronous layout reads in tab indicator animations (`getBoundingClientRect` inside `handleValueChange`) cause forced reflows. Use `requestAnimationFrame` and `offsetLeft`/`offsetWidth`:

```tsx
const moveIndicator = useCallback((tabName) => {
    requestAnimationFrame(() => {
        const tabItem = tabsListItemsRef.current[tabName];
        if (!tabItem || !tabsListRef.current) return;
        setIndicator([tabItem.offsetLeft - tabsListRef.current.offsetLeft, tabItem.offsetWidth]);
    });
}, []);
```

## 12. Document-level focus listeners for AG Grid

Cell editors may need capture-phase `focusout` listeners to prevent AG Grid from stealing focus when Base UI popovers are open. This is a legitimate workaround — keep it, but use only `focusout` (not redundant `blur`), and clean up on unmount.
