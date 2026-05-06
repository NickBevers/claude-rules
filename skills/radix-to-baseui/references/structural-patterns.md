# Structural Patterns

## The Positioner Layer

Radix puts positioning props directly on Content. Base UI requires an explicit Positioner wrapper.

```tsx
// RADIX
<PopoverPrimitive.Portal>
    <PopoverPrimitive.Content align="center" side="bottom" sideOffset={4} className="z-50 ...">
        {children}
    </PopoverPrimitive.Content>
</PopoverPrimitive.Portal>

// BASE UI
<PopoverPrimitive.Portal>
    <PopoverPrimitive.Positioner className="z-50" align="center" side="bottom" sideOffset={4}>
        <PopoverPrimitive.Popup className="...">
            {children}
        </PopoverPrimitive.Popup>
    </PopoverPrimitive.Positioner>
</PopoverPrimitive.Portal>
```

### Rules
- z-index goes on **Positioner**, NOT Popup
- `side`, `sideOffset`, `align`, `alignOffset` are **Positioner** props
- Applies to: Popover, Menu, Tooltip, Select, HoverCard (via Popover)
- Does NOT apply to: Dialog, AlertDialog, Drawer (centered/edge-anchored, no Positioner)

### Positioner Props

| Prop | Type | Default |
|---|---|---|
| `side` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` (Tooltip: `'top'`) |
| `sideOffset` | `number` | `0` |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` |
| `alignOffset` | `number` | `0` |
| `anchor` | `Element \| RefObject \| VirtualElement` | trigger |
| `positionMethod` | `'absolute' \| 'fixed'` | `'absolute'` |
| `collisionBoundary` | `Element \| Rect \| 'clipping-ancestors'` | `'clipping-ancestors'` |
| `collisionPadding` | `number \| Padding` | `5` |
| `sticky` | `boolean` | `false` |

## asChild → render Adapter

Radix uses `asChild` to render children as the component. Base UI uses `render`.

```tsx
type Props = ComponentProps<typeof PopoverPrimitive.Trigger> & {
    asChild?: boolean;
};

function PopoverTrigger({ asChild, children, ...props }: Props) {
    if (asChild) {
        return <PopoverPrimitive.Trigger render={children as ReactElement} {...props} />;
    }
    return <PopoverPrimitive.Trigger {...props}>{children}</PopoverPrimitive.Trigger>;
}
```

Apply to every Trigger, Close, Cancel, Action component. Keep `asChild` in the wrapper API so consumer code doesn't change.

## Animation Patterns

### CSS Transitions (Dialog, AlertDialog, Sheet/Drawer, Backdrop)

```tsx
// Backdrop
'fixed inset-0 z-50 bg-black/50 transition-opacity',
'data-starting-style:opacity-0',
'data-ending-style:opacity-0',

// Dialog — center scale
'transition-[opacity,scale,translate] duration-200',
'data-starting-style:scale-95 data-starting-style:opacity-0',
'data-ending-style:scale-95 data-ending-style:opacity-0',

// Sheet — slide from right
'transition-translate duration-300 ease-in-out',
'data-starting-style:translate-x-full',
'data-ending-style:translate-x-full',
```

### Tailwind Keyframes (Popover, Menu, Tooltip, Select)

```tsx
'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
```

### Directional Slides (same in both)

```tsx
'data-[side=top]:slide-in-from-bottom-2',
'data-[side=right]:slide-in-from-left-2',
'data-[side=bottom]:slide-in-from-top-2',
'data-[side=left]:slide-in-from-right-2',
```

Use `origin-(--transform-origin)` on Popup for zoom animations to scale from anchor direction.

## Custom Slot Component

Replace `@radix-ui/react-slot` with a local implementation:

```tsx
import { Children, cloneElement, forwardRef, isValidElement } from 'react';

function mergeProps(slotProps, childProps) {
    const overrideProps = { ...childProps };
    for (const propName in childProps) {
        const isHandler = /^on[A-Z]/.test(propName);
        if (isHandler && slotProps[propName] && childProps[propName]) {
            overrideProps[propName] = (...args) => {
                childProps[propName](...args);
                slotProps[propName](...args);
            };
        } else if (propName === 'className') {
            overrideProps[propName] = [slotProps[propName], childProps[propName]].filter(Boolean).join(' ');
        } else if (propName === 'style') {
            overrideProps[propName] = { ...slotProps[propName], ...childProps[propName] };
        }
    }
    return { ...slotProps, ...overrideProps };
}

const Slot = forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    if (isValidElement(children)) {
        return cloneElement(children, {
            ...mergeProps(slotProps, children.props),
            ref: forwardedRef ? composeRefs(forwardedRef, children.ref) : children.ref,
        });
    }
    return null;
});
```

Used by components with `asChild` that render plain elements (Button, Badge, InlineLink, TextInput, breadcrumb) — NOT Base UI primitives (those use `render` prop).
