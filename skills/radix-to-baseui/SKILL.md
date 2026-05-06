---
name: radix-to-baseui
description: "Migrate components from Radix UI primitives to Base UI (@base-ui/react). Activates when working with Base UI components, fixing Radix→Base UI migration issues, troubleshooting data attributes, positioning, focus management, or animation differences between the two libraries."
---

# Radix UI → Base UI Migration

Every difference between Radix UI and Base UI. For detailed code examples, read the relevant reference file before implementing:

- `references/mappings.md` — complete package, sub-component, data attribute, and CSS variable mapping tables
- `references/structural-patterns.md` — Positioner layer, asChild→render adapter, animation patterns, custom Slot
- `references/api-changes.md` — onOpenChange signature, dismissal/closing, focus management, HoverCard delay
- `references/component-examples.md` — side-by-side Radix vs Base UI code for every component
- `references/pitfalls.md` — 12 real bugs from a production migration and how to avoid them

## Quick Reference

### Import Change

```tsx
// Radix: namespace import from separate packages
import * as PopoverPrimitive from '@radix-ui/react-popover';

// Base UI: named import from single package with subpath
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
```

### Core Renames

| Radix | Base UI |
|---|---|
| `*.Content` | `*.Popup` (wrap in `*.Positioner` for floating components) |
| `*.Overlay` | `*.Backdrop` |
| `Tabs.Trigger` | `Tabs.Tab` |
| `Tabs.Content` | `Tabs.Panel` |
| `Select.Viewport` | `Select.List` |
| `DropdownMenu.*` | `Menu.*` |
| `asChild` prop | `render` prop |

### Data Attributes

| Radix | Base UI |
|---|---|
| `data-[state=open]:` | `data-open:` |
| `data-[state=closed]:` | `data-closed:` |
| `data-[state=checked]:` | `data-checked:` |
| `data-[state=unchecked]:` | `data-unchecked:` |

### CSS Variables

All `--radix-*-content-transform-origin` → `--transform-origin`, `--radix-*-trigger-width` → `--anchor-width`, `--radix-*-content-available-height` → `--available-height`.

### Positioner Pattern (floating components only)

```tsx
<Primitive.Portal>
    <Primitive.Positioner className="z-50" side={side} sideOffset={sideOffset} align={align}>
        <Primitive.Popup className="origin-(--transform-origin) ...">
            {children}
        </Primitive.Popup>
    </Primitive.Positioner>
</Primitive.Portal>
```

z-index goes on **Positioner**, not Popup. Applies to: Popover, Menu, Tooltip, Select. NOT Dialog, AlertDialog, Drawer.

### Removed Callback Props

| Radix (on Content) | Base UI (on Root) |
|---|---|
| `onInteractOutside={(e) => e.preventDefault()}` | `disablePointerDismissal` |
| `onEscapeKeyDown={(e) => e.preventDefault()}` | Filter `onOpenChange` by `reason === 'escape-key'` |
| `onOpenAutoFocus` | `initialFocus` (boolean, ref, or callback) |
| `onCloseAutoFocus` | `finalFocus` (boolean, ref, or callback) |

### Migration Order

1. Install `@base-ui/react`, create custom Slot, Separator, Label
2. Simple swaps: Button/Badge (Slot only), Avatar, Checkbox, Switch, Collapsible
3. Positioned: Tooltip → Popover → HoverCard → Menu
4. Overlays: Dialog → AlertDialog → Sheet/Drawer
5. Complex: Tabs, Select
6. Cleanup: remove all `@radix-ui/*` packages

### Verification

```bash
grep -r '@radix-ui' resources/js/ --include="*.tsx"
grep -r 'data-\[state=' resources/js/ --include="*.tsx"
grep -r '\-\-radix-' resources/js/ --include="*.tsx" --include="*.css"
npx tsc --noEmit
```
