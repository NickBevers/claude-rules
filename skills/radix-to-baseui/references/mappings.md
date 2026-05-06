# Complete Mapping Tables

## Package → Import Path

| Radix Package | Base UI Import | Renamed? |
|---|---|---|
| `@radix-ui/react-popover` | `@base-ui/react/popover` | No |
| `@radix-ui/react-dialog` | `@base-ui/react/dialog` | No |
| `@radix-ui/react-alert-dialog` | `@base-ui/react/alert-dialog` | No |
| `@radix-ui/react-dropdown-menu` | `@base-ui/react/menu` | Yes: DropdownMenu → Menu |
| `@radix-ui/react-tooltip` | `@base-ui/react/tooltip` | No |
| `@radix-ui/react-select` | `@base-ui/react/select` | No |
| `@radix-ui/react-tabs` | `@base-ui/react/tabs` | No |
| `@radix-ui/react-checkbox` | `@base-ui/react/checkbox` | No |
| `@radix-ui/react-switch` | `@base-ui/react/switch` | No |
| `@radix-ui/react-collapsible` | `@base-ui/react/collapsible` | No |
| `@radix-ui/react-avatar` | `@base-ui/react/avatar` | No |
| `@radix-ui/react-slot` | Custom `Slot` component | Replaced (see structural-patterns.md) |
| `@radix-ui/react-separator` | Plain `<div role="separator">` | Removed |
| `@radix-ui/react-label` | Plain `<label>` | Removed |
| `@radix-ui/react-visually-hidden` | CSS class `sr-only` | Removed |
| `@radix-ui/react-hover-card` | `@base-ui/react/popover` + `openOnHover` | Merged |
| Sheet (built on Dialog) | `@base-ui/react/drawer` | Changed primitive |

## Sub-component Name Mapping

| Radix Sub-component | Base UI Sub-component | Notes |
|---|---|---|
| `*.Content` | `*.Popup` | Must be wrapped in `*.Positioner` for positioned components |
| `*.Overlay` | `*.Backdrop` | |
| `*.Trigger` | `*.Trigger` | Same name, uses `render` prop instead of `asChild` |
| `*.Close` | `*.Close` | Same |
| `*.Title` | `*.Title` | Same |
| `*.Description` | `*.Description` | Same |
| `*.Portal` | `*.Portal` | Same |
| `*.Arrow` | `*.Arrow` | Same |
| `Tabs.Trigger` | `Tabs.Tab` | Renamed |
| `Tabs.Content` | `Tabs.Panel` | Renamed |
| `Tabs.List` | `Tabs.List` | Same |
| `Select.Viewport` | `Select.List` | Renamed |
| `Select.ScrollUpButton` | `Select.ScrollUpArrow` | Renamed |
| `Select.ScrollDownButton` | `Select.ScrollDownArrow` | Renamed |
| `Select.Label` | `Select.GroupLabel` | Renamed |
| `Menu.SubTrigger` | `Menu.SubmenuTrigger` | Renamed |
| `Menu.SubContent` | `Menu.Positioner` > `Menu.Popup` | Requires Positioner wrapper |
| `Menu.Label` | `Menu.GroupLabel` | Renamed |
| `Collapsible.Content` | `Collapsible.Panel` | Renamed |
| `Checkbox.Indicator` | `Checkbox.Indicator` | Same, adds `keepMounted` prop |

### New Sub-components (no Radix equivalent)

| Base UI Sub-component | Purpose |
|---|---|
| `*.Positioner` | Positioning wrapper for floating content (Popover, Menu, Tooltip, Select) |
| `Drawer.Viewport` | Fixed container wrapping the Drawer Popup |
| `Tabs.Indicator` | Animated active tab indicator |

## Data Attribute Migration

| Radix Tailwind Selector | Base UI Tailwind Selector | Used By |
|---|---|---|
| `data-[state=open]:` | `data-open:` | Popover, Dialog, Menu, Tooltip, Collapsible |
| `data-[state=closed]:` | `data-closed:` | All closeable components |
| `data-[state=checked]:` | `data-checked:` | Checkbox, Switch |
| `data-[state=unchecked]:` | `data-unchecked:` | Checkbox, Switch |
| `data-[state=indeterminate]:` | `data-indeterminate:` | Checkbox |
| `data-[state=active]:` | `data-active:` (custom) or `data-selected` (Base UI internal) | Tabs |
| `group-data-[state=open]:` | `group-data-open:` | Nested/group selectors |
| `group-data-[state=closed]:` | `group-data-closed:` | Nested/group selectors |

Preserved (same): `data-[side=*]`, `data-[disabled]`, `data-[highlighted]`.

### New Attributes (Base UI only)

| Attribute | Set On | Purpose |
|---|---|---|
| `data-starting-style` | Popup, Backdrop | Present during enter transition |
| `data-ending-style` | Popup, Backdrop | Present during exit transition |
| `data-instant` | Popup | `'click' \| 'dismiss'` — skips animation |
| `data-anchor-hidden` | Positioner | Anchor scrolled out of view |

## CSS Variable Migration

| Radix Variable | Base UI Variable |
|---|---|
| `--radix-popover-content-transform-origin` | `--transform-origin` |
| `--radix-popover-content-available-height` | `--available-height` |
| `--radix-popover-trigger-width` | `--anchor-width` |
| `--radix-tooltip-content-transform-origin` | `--transform-origin` |
| `--radix-dropdown-menu-content-transform-origin` | `--transform-origin` |
| `--radix-dropdown-menu-content-available-height` | `--available-height` |
| `--radix-select-content-transform-origin` | `--transform-origin` |
| `--radix-select-content-available-height` | `--available-height` |
| `--radix-select-trigger-width` | `--anchor-width` |

Additional CSS variables provided by Base UI Positioner: `--available-width`, `--anchor-height`, `--positioner-width`, `--positioner-height`. Popup provides: `--popup-width`, `--popup-height`.
