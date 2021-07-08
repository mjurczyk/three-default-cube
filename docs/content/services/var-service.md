---
title: "VarService"
draft: false
weight: 15
---

## setVar ()

`setVar(key, value)`

Sets a system variable.

## getVar ()

`getVar(key, onUpdate, onCreate)`

Returns system variable value immediately.

`onUpdate` is called immediately, and on each update of the variable, with variable value.
`onCreate` is called immediately with a change listener reference.

## removeVar ()

`removeVar(key)`

Removes a system variable and its listeners.

## registerPersistentVar ()

`registerPersistentVar(id, defaultValue)`

Registers a system variable as persistent. Persistent variables are automatically saved locally when changed.

If variable was not saved locally earlier, `defaultValue` is assigned.

## resolveVar ()

`resolveVar(variableString, onResolve, onCreate)`

Resolve `:variable:` notation.

If `variableString` is not a valid variable notation - `onResolve` is called with `variableString`.

If `variableString` is a valid variable notation - `onResolve` acts as `onUpdate` in `VarService.getVar`. Additionally, `onCreate` then also acts as `onCreate` in `VarService.getVar`.
