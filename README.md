# JSM Visualiser

A web app for visualising **JSON State Machine (JSM)** files as interactive flowcharts.

Upload or paste a JSM JSON file and get an editable flowchart — nodes, transitions, entry actions, and nested child states are all rendered automatically with a sensible default layout.

## Features

- Paste or upload a JSM JSON file
- Auto-layout flowchart rendered on load
- Drag nodes to customise the layout
- Nested child states rendered as grouped sub-flows
- Transition labels derived from `exitChecks`

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## JSM Format

```json
{
  "start": "Pending",
  "states": [
    {
      "name": "Pending",
      "entryActions": [
        { "check": "Truthy Statement", "action": "Perform Logic" }
      ],
      "exitChecks": [
        { "check": "Truthy Statement", "goTo": "Complete.Success" },
        { "check": "Error Case",       "goTo": "Complete.Error" }
      ]
    },
    {
      "name": "Complete",
      "children": [
        { "name": "Success" },
        { "name": "Error" }
      ]
    }
  ]
}
```

- `start` — name of the initial state
- `entryActions` — conditional logic run on entering a state
- `exitChecks` — conditional transitions; `goTo` uses dot-notation for child states (`"Complete.Success"`)
- `children` — nested child states, rendered as a sub-group

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- React Flow (flowchart rendering)
- TypeScript
