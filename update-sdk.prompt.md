# Prompt: Move the example apps to a new SkyState SDK version

**Run this prompt after a new version of `@skystate/react` or `@skystate/core` is on npm and
the matching API is live in production.**

No CI automation. Manual, on demand.

---

## Goal

Every example app in this repo builds, passes its tests, and works against production on the
newest published SDK. The result is one pull request for a human to approve. Merging to
`master` deploys the live demos to GitHub Pages (`.github/workflows/deploy.yml`), so never
merge it yourself.

---

## Step 1: Find the apps and the versions

Each top-level folder with a `package.json` is one app (today only `notes`).

```bash
git ls-files | grep -E '(^|/)package\.json$' | xargs grep -n '@skystate/'
npm view @skystate/react version
npm view @skystate/core version
```

If every app is already on the newest version, stop and say so.

## Step 2: Record the baseline

Before changing anything, run the app's checks on `master` and write down what fails. A test
that already fails on `master` is not caused by the bump.

```bash
cd <app>
npm ci
npm run build
npm test
CHROME_PATH=$(which google-chrome) npm run test:browser
```

Known flaky test in `notes`: "account menu exposes styled theme controls inline and supports
keyboard navigation". Run the browser tests three times before you call a failure real.

## Step 3: Bump and read what changed

```bash
git checkout -b sdk-<version>
cd <app>
npm install @skystate/react@^<version>
npm run build
```

The compile errors are the first list of what to fix. The second list is the changelog and
README the package ships:

- `node_modules/@skystate/react/CHANGELOG.md` and `node_modules/@skystate/core/CHANGELOG.md`:
  read every section between the old and the new version. Lines that start with "Breaking:"
  matter most.
- `node_modules/@skystate/react/README.md`: the Quickstart shows the current setup.
- `node_modules/@skystate/react/dist/index.d.ts`: the exact types.

Work from these files, not from memory. The SDK changes between major versions.

## Step 4: Fix the app

Fix every compile error the way the new README does it. Keep the app a small, readable
example: use the SDK's documented surface, and add no workaround a reader would not expect.

Then look for changes the compiler cannot see. A changelog line about behaviour (what
`health` means, when writes are sent, which routes are called) can break the app while the
build stays green. For each such line, find the code in the app that relies on the old
behaviour.

The browser tests in `tests/browser/` run the real SDK against a mocked API. When the SDK
changes a route, a request body, or the local storage key, update the mock to match. Find the
current ones in `node_modules/@skystate/core/dist/` (`api-url.js` for routes).

Update the app's `README.md` when a file it names has moved.

## Step 5: Verify

```bash
npm run build
npm test
CHROME_PATH=$(which google-chrome) npm run test:browser
```

All three must be green, apart from failures recorded in step 2. For a browser test that
fails only after the bump, find the cause before touching the test: change the test only when
the test's own assumption is out of date (a route name, write timing), never to hide a bug in
the app.

Then check that production serves the routes the new SDK calls. Take the account, project and
environment from the app's client setup:

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  https://api.skystate.io/v1/<account>/projects/<project>/project-state/public/production
```

`200` or `204` means the route exists. A `404` means the API is not deployed yet: stop and
report it.

A real sign-in needs a human in a browser. Say plainly in the pull request that it was not
checked.

## Step 6: Open the pull request

One commit, one pull request against `master`. The body lists:

- what changed, file by file, in plain English,
- the result of each check from step 5,
- every test that fails and whether it also fails on `master`,
- what was not checked (the real sign-in),
- that merging deploys the live demos.

Open issues in this repo: close one only when this change really fixes it. Otherwise leave it
open and name it in the pull request.

After the merge, the human signs in once on each live demo, for example
https://skystate.github.io/examples/notes/.
