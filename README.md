# SkyState Examples

Example apps built with [SkyState](https://skystate.dev), a hosted service for remote config and synced user state. Each example is a small, self-contained app with no backend code of its own.

## Examples

| Example | Description | Live demo |
| --- | --- | --- |
| [syncnote](./syncnote) | A minimal personal notepad that syncs across devices. React, TypeScript, and Tailwind, with auth and persistence handled by SkyState. | [skystate.github.io/examples/syncnote](https://skystate.github.io/examples/syncnote/) |

## Running an example

Each example has its own README with setup instructions. In general:

```bash
cd syncnote
npm install
npm run dev
```

To run against your own SkyState project, create one in the SkyState console and update the provider config noted in the example's README.

## License

No license has been granted yet. All rights reserved.
