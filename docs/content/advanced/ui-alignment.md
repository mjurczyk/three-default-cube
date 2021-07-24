---
title: "UI Alignment"
draft: false
weight: 12
demoId: 'ui-alignment'
---

## Aligning Elements on the Screen

You can align UI elements absolutely on the screen using `left`, `right`, `top`, and `bottom` custom properties. All four of them can take either a number or a percentage value - they can also use variables defined in `VarService`.

**Note:** Alignment properties can only be used on elements that are part of the UI layer. Be sure to use `UIService.registerUiElement` on the UI model before parsing it.
