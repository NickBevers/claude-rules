# Component-by-Component Examples

Side-by-side Radix vs Base UI for every component.

## Dialog

```tsx
// Radix
<DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="..." />
    <DialogPrimitive.Content className="...">{children}</DialogPrimitive.Content>
</DialogPrimitive.Portal>

// Base UI
<DialogPrimitive.Portal>
    <DialogPrimitive.Backdrop className="..." />
    <DialogPrimitive.Popup className="...">{children}</DialogPrimitive.Popup>
</DialogPrimitive.Portal>
```

No Positioner — center via CSS (`fixed top-1/2 left-1/2 -translate-x/y-1/2`).

## AlertDialog

Same as Dialog. Root omits `modal` (always modal) and `disablePointerDismissal` (always true). Escape still works — intercept via `onOpenChange` reason if needed.

## Sheet / Drawer

```tsx
// Radix (built on Dialog)
<DialogPrimitive.Portal>
    <DialogPrimitive.Overlay />
    <DialogPrimitive.Content className="fixed inset-y-0 right-0 ..." />
</DialogPrimitive.Portal>

// Base UI (built on Drawer)
<DrawerPrimitive.Portal>
    <DrawerPrimitive.Backdrop className="..." />
    <DrawerPrimitive.Viewport className="fixed inset-0 z-50">
        <DrawerPrimitive.Popup className="fixed inset-y-0 right-0 ..." />
    </DrawerPrimitive.Viewport>
</DrawerPrimitive.Portal>
```

Drawer adds: `swipeDirection` (`'up' | 'down' | 'left' | 'right'`), snap points.

## Menu (DropdownMenu)

```tsx
// Radix
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
<DropdownMenuPrimitive.Root>
    <DropdownMenuPrimitive.Trigger />
    <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content align="end" sideOffset={4}>
            <DropdownMenuPrimitive.Item onSelect={handler} />
            <DropdownMenuPrimitive.Label />
            <DropdownMenuPrimitive.Separator />
        </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
</DropdownMenuPrimitive.Root>

// Base UI
import { Menu as MenuPrimitive } from '@base-ui/react/menu';
<MenuPrimitive.Root>
    <MenuPrimitive.Trigger />
    <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner align="end" sideOffset={4}>
            <MenuPrimitive.Popup>
                <MenuPrimitive.Item onClick={handler} />
                <MenuPrimitive.GroupLabel />
                <MenuPrimitive.Separator />
            </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
</MenuPrimitive.Root>
```

`onSelect` → `onClick`, `Label` → `GroupLabel`, `SubTrigger` → `SubmenuTrigger`. `Item` has `closeOnClick` (default `true`).

## Select

```tsx
// Radix
<SelectPrimitive.Content position="popper">
    <SelectPrimitive.ScrollUpButton />
    <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
    <SelectPrimitive.ScrollDownButton />
</SelectPrimitive.Content>

// Base UI
<SelectPrimitive.Portal>
    <SelectPrimitive.Positioner>
        <SelectPrimitive.Popup>
            <SelectPrimitive.ScrollUpArrow />
            <SelectPrimitive.List>{children}</SelectPrimitive.List>
            <SelectPrimitive.ScrollDownArrow />
        </SelectPrimitive.Popup>
    </SelectPrimitive.Positioner>
</SelectPrimitive.Portal>
```

`Select.Value` now accepts a render function: `<Select.Value>{(value) => formatValue(value)}</Select.Value>`.

## Tooltip

```tsx
// Radix
<TooltipPrimitive.Provider delayDuration={0} skipDelayDuration={300}>
    <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger />
        <TooltipPrimitive.Content side="top" sideOffset={4}>{children}</TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
</TooltipPrimitive.Provider>

// Base UI
<TooltipPrimitive.Provider delay={0} closeDelay={300}>
    <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger />
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Positioner side="top" sideOffset={4}>
                <TooltipPrimitive.Popup>{children}</TooltipPrimitive.Popup>
            </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
</TooltipPrimitive.Provider>
```

`delayDuration` → `delay`, `skipDelayDuration` → `closeDelay`, `disableHoverableContent` → `disableHoverablePopup`.

## HoverCard → Popover

```tsx
// Radix
<HoverCardPrimitive.Root openDelay={100} closeDelay={300}>
    <HoverCardPrimitive.Trigger asChild>{trigger}</HoverCardPrimitive.Trigger>
    <HoverCardPrimitive.Content>{children}</HoverCardPrimitive.Content>
</HoverCardPrimitive.Root>

// Base UI — delay/closeDelay go on Trigger, not Root
<PopoverPrimitive.Root>
    <PopoverPrimitive.Trigger openOnHover delay={100} closeDelay={300} render={trigger} />
    <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner>
            <PopoverPrimitive.Popup>{children}</PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
</PopoverPrimitive.Root>
```

## Tabs

```tsx
// Radix
<TabsPrimitive.Root>
    <TabsPrimitive.List>
        <TabsPrimitive.Trigger value="tab1">Tab 1</TabsPrimitive.Trigger>
    </TabsPrimitive.List>
    <TabsPrimitive.Content value="tab1">Content</TabsPrimitive.Content>
</TabsPrimitive.Root>

// Base UI
<TabsPrimitive.Root>
    <TabsPrimitive.List>
        <TabsPrimitive.Tab value="tab1">Tab 1</TabsPrimitive.Tab>
    </TabsPrimitive.List>
    <TabsPrimitive.Panel value="tab1" keepMounted={forceMount}>Content</TabsPrimitive.Panel>
</TabsPrimitive.Root>
```

`Trigger` → `Tab`, `Content` → `Panel`, `forceMount` → `keepMounted`.

## Checkbox

```tsx
// Radix data selectors
'data-[state=checked]:bg-primary data-[state=unchecked]:bg-white'

// Base UI data selectors
'data-checked:bg-primary data-unchecked:bg-white'
```

Indicator: add `keepMounted` prop if indicator should always be in the DOM.

## Switch

Same data attribute change: `data-[state=checked/unchecked]` → `data-checked/data-unchecked`.

## Collapsible

`Content` → `Panel`. Data: `data-[state=open/closed]` → `data-open/data-closed`. Panel adds `keepMounted` and `hiddenUntilFound`.
