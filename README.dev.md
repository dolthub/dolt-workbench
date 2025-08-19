# Developer Guide

## Releasing dolt-workbench (manual)
NOTE: This method of releasing the workbench has now been automated. See "Releasing dolt-workbench (automated)" below.

### 1. Use the `Release dolt-workbench` GitHub Action

See [here](https://github.com/dolthub/dolt-workbench/actions/workflows/cd-release.yaml). The version used should match the `version` in `web/package.json` (which can be updated before or after running this action).

This creates the release and starts two other Actions: generating the release notes and pushing the Docker image to Docker Hub.

### 2. Build and release the desktop app

First, build the graphql-server.

```bash
# in `graphql-server`
yarn
yarn build
```

Then install dependencies in `web` and download Dolt.

```bash
# in web
yarn
yarn download:dolt
```

If this is your first time releasing dolt-workbench, see more in-depth instructions for set up in [this README](./web/README.desktop-app.md) and [this blog](https://www.dolthub.com/blog/2025-07-31-mac-and-windows-release/).

#### Mac

1. Increment `buildVersion` in `build/mac/builder-mas-config.yaml` and `build/mac/builder-dmg-config.yaml`.

2. Build for Mac Store

```bash
# in web
yarn build:mas
```

3. Upload `dist/DoltWorkbench-mac-universal.pkg` to the [Transporter app](https://apps.apple.com/us/app/transporter/id1450874784) and click Deliver

4. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com/) and click on Apps > Dolt Workbench. Go to the TestFlight tab and assign the `workbench-test` test group to the new version (it may take a bit for it to be delivered by the Transporter app)

5. Make sure the new version works using the [TestFlight](https://apps.apple.com/us/app/testflight/id899247664) app

6. Add a new version using the `+` sign in the left panel. Add a version that matches the `package.json` version. Fill out what's new in this version and choose the build you just tested. Click Submit for Review.

7. Build for outside Mac Store (to attach to the GitHub release)

```bash
# in web
yarn build:dmg
```

8. Sign the DMG package

```bash
# in web
yarn sign-dmg
```

9. Attach the generated package in `dist` to the GitHub release that was generated in the first step

#### Windows

Note that you must use a Windows machine for this.

1. Increment the `buildVersion` in `web/build/builder-win-config.yaml`

2. Build the Windows package

```bash
# in web
yarn build:win
```

3. Log into [Microsoft Partner Center](https://partner.microsoft.com/en-us/dashboard/apps-and-games/overview). To submit, choose DoltHub.Inc -> Apps and Games -> Dolt-Workbench. Choose Start Update in Product Release.

4. Upload the `AppX` file from `dist`. In Product Update > Store listings click on a language and fill out "What's new in this version". Click Submit for certification.

5. Upload the `Application` file file from `dist` to the GitHub release that was generated in the first step

#### Linux

1. Increment the `buildVersion` in `web/build/builder-linux-config.yaml`

2. Build the package for Linux

```bash
# in web
yarn build:linux
```

3. Upload the `dolt-arm64` and `dolt-x64` binaries located in `web/build/linux` to the GitHub release that was generated in the first step

## Releasing dolt-workbench (automated)

### Use the `Release dolt-workbench` GitHub Action
The input to this GitHub Action is a version number. You should use the version number that you would like to be associated with this release.
The action will automatically create a new commit to update the version in web/package.json to the version number you pass here. It will also create a new GitHub release
with the title being the new version number.

This action will kick off a separate workflow for Windows, Linux, Mac App Store, and Mac (.dmg) builds. If the builds were successful, you should see
1. A new commit bumping the `buildVersion` field by one for each builder config yaml file in `web/build`.
2. The packages uploaded as assets to the new release that was just created.

Note that you can also run each of the platform-specific actions by themselves. For example, if you
run the `Release dolt-workbench` action and everything succeeds except for the Linux build, you can
run the `Build dolt-workbench for Linux` action by itself (passing as input an existing release version number),
and it will just build the Linux package and upload it to the release you specified.

