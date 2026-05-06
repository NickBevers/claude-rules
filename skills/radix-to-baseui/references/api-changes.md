# API Changes

## onOpenChange Signature

Radix: `(open: boolean)`. Base UI: `(open: boolean, eventDetails: { reason: string })`.

| Reason | Meaning |
|---|---|
| `'trigger-press'` | User clicked the trigger |
| `'outside-press'` | User clicked outside the popup |
| `'escape-key'` | User pressed Escape |
| `'close-press'` | User clicked a Close button |
| `'focus-out'` | Focus moved outside |
| `'imperative-action'` | Programmatic close |
| `'swipe'` | Drawer swipe gesture |

### Wrapper to preserve consumer API

```tsx
type Props = Omit<ComponentProps<typeof DialogPrimitive.Root>, 'onOpenChange'> & {
    onOpenChange?: (open: boolean) => void;
};

export function Dialog({ onOpenChange, ...props }: Props) {
    return (
        <DialogPrimitive.Root
            onOpenChange={onOpenChange ? (open) => onOpenChange(open) : undefined}
            {...props}
        />
    );
}
```

## Dismissal / Closing

### Outside Click Prevention

| Radix | Base UI |
|---|---|
| `<Content onInteractOutside={(e) => e.preventDefault()}>` | `<Root disablePointerDismissal>` |

`disablePointerDismissal` goes on **Root** (Dialog, Drawer), not Popup. AlertDialog always prevents outside clicks.

### Escape Key Prevention

No Base UI prop for this. Intercept via `onOpenChange` reason:

```tsx
export function Dialog({ onOpenChange, preventEscapeKeyDown, ...props }: Props) {
    const handleOpenChange = useCallback(
        (open: boolean, eventDetails: { reason: string }) => {
            if (!open && eventDetails.reason === 'escape-key') {
                const shouldPrevent = typeof preventEscapeKeyDown === 'function'
                    ? preventEscapeKeyDown()
                    : preventEscapeKeyDown;
                if (shouldPrevent) return;
            }
            onOpenChange?.(open);
        },
        [onOpenChange, preventEscapeKeyDown]
    );
    // ...
}
```

Supports static `preventEscapeKeyDown={true}` and conditional `preventEscapeKeyDown={() => isSubmitting}`.

### Modal Defaults

| Component | Radix | Base UI |
|---|---|---|
| Dialog | `modal={true}` | `modal={true}` |
| AlertDialog | `modal={true}` | Always modal (cannot change) |
| Popover | `modal={false}` | `modal={false}` |
| Menu | `modal={true}` | `modal={true}` |
| Drawer | N/A | `modal={true}` |

Base UI `modal` accepts `boolean | 'trap-focus'`. `'trap-focus'` traps focus without backdrop.

## Focus Management

### initialFocus / finalFocus

| Radix | Base UI |
|---|---|
| `onOpenAutoFocus={(e) => { e.preventDefault(); ref.current?.focus(); }}` | `initialFocus={ref}` |
| `onOpenAutoFocus={(e) => e.preventDefault()}` | `initialFocus={false}` |
| `onCloseAutoFocus={(e) => { e.preventDefault(); ref.current?.focus(); }}` | `finalFocus={ref}` |
| `onCloseAutoFocus={(e) => e.preventDefault()}` | `finalFocus={false}` |

Accepted types:

```tsx
initialFocus?:
    | boolean              // true = auto-focus first focusable, false = skip
    | RefObject<HTMLElement> // focus this element
    | ((openType: 'mouse' | 'touch' | 'pen' | 'keyboard') => boolean | HTMLElement | null | void)
```

Available on: `Popover.Popup`, `Dialog.Popup`, `Drawer.Popup`. NOT on `Tooltip.Popup` or `Menu.Popup`.

### Backward-compatible shim

If consumers still pass `onOpenAutoFocus` callbacks:

```tsx
function createPreventableEvent(): Event & { defaultPrevented: boolean } {
    const event = { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    return event as Event & { defaultPrevented: boolean };
}

const handleInitialFocus = useCallback(() => {
    if (!onOpenAutoFocus) return true;
    const event = createPreventableEvent();
    onOpenAutoFocus(event);
    return !event.defaultPrevented;
}, [onOpenAutoFocus]);

<Popup initialFocus={onOpenAutoFocus ? handleInitialFocus : undefined} />
```

Do NOT use `new Event()` + `Object.defineProperty`.

## HoverCard Delay

Base UI has no HoverCard. Use Popover with `openOnHover` on Trigger.

`delay` and `closeDelay` go on **Trigger** (not Root):

```tsx
<PopoverPrimitive.Trigger openOnHover delay={openDelay} closeDelay={closeDelay}>
```

If your wrapper API puts delays on Root (like Radix HoverCard did), pass them to Trigger via React context.

## Tooltip Prop Renames

| Radix | Base UI |
|---|---|
| `Provider delayDuration` | `Provider delay` |
| `Provider skipDelayDuration` | `Provider closeDelay` |
| `Root disableHoverableContent` | `Root disableHoverablePopup` |

## Menu Prop Changes

| Radix | Base UI |
|---|---|
| `Item onSelect` | `Item onClick` |
| `Item` (auto-closes) | `Item closeOnClick` (default `true`) |
