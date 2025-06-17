# dolt-workbench Desktop Application

## Run the desktop app in dev mode:

1. Rebuild `graphql-server` (if changes were made):

```bash
# in graphql-server
yarn build
```

2.Start the desktop app:

```bash
# in web
yarn dev:app
```

## Releasing the application

### Prerequisites for Mac

1. Create an Apple Developer account with your @dolthub.com email and contact Tim for access.
2. [Register your device](https://www.dolthub.com/blog/2024-10-02-how-to-submit-an-electron-app-to-mac-app-store/#register-your-device)
3. Download the [provision profiles](https://developer.apple.com/account/resources/profiles/list) `AppleDevelopment` and `MacAppStore` and put them in `web/build/mac`
4. Download the [certificates](https://developer.apple.com/account/resources/certificates/list) named `Distribution`, `Mac Installer Distribution`, and `Developer ID Application`. Once they are added to your Keychain, you should also see them if you log into your Apple Developer account in Xcode in Account > Manage Certificates. You will need an additional certificate and password from Tim for the Developer ID Application. You may need to restart your computer for the certificates to be valid.

See this this blog for more details: https://www.dolthub.com/blog/2024-10-02-how-to-submit-an-electron-app-to-mac-app-store/#generate-provisioning-profiles

### Prerequisites for Windows

Ask Tim to invite you to our DoltHub organization in the [Microsoft Partner Center](https://partner.microsoft.com/en-us/dashboard/apps-and-games/overview). The Dolt Workbench is published in the Microsoft Store [here](https://apps.microsoft.com/detail/9nq8lqph9vvh?hl=en-us&gl=US).

### Build the packages

1. Install dependencies and build in the `graphql-server` directory:

```bash
# in `graphql-server`
yarn
yarn build
```

2. Install dependencies in web:

```bash
# in web
yarn
```

3. Download the latest dolt binaries:

```bash
# in web
yarn download:dolt
```

4. Build the packages

To build for MAC store:

```bash
# in web
yarn build:mas
```

To build the package outside MAC store (used to attach to the GitHub release) (note that the builds go in the same `dist` file as mas, so be careful not to overwrite it):

```bash
# in web
yarn build:dmg
```

On a Windows computer, build the windows app (building it from a Mac machine will fail with “Cannot find suitable Parallels Desktop virtual machine (Windows 10 is required) and cannot access `pwsh` and `wine` locally” errors):

```bash
# in web
yarn build:win
```

On any computer, build the Linux app:

```bash
# in web
yarn build:linux
```

### Submit to MAC store

We will only use `mas-universal` folder for submitting to MAC store. There will be a `Dolt Workbench.app` application file in `dist` and a `Dolt Workbench-mac-universal.pkg` installer file inside it. These files cannot be used locally, they are for MAC store submission. When double clicking on them, it will show "could not be opened". This is expected because they are packed in sandbox and need to be signed by Apple before distribution.

The preferred tool to submit is the [Transporter app](https://apps.apple.com/us/app/transporter/id1450874784), which can be downloaded free from the Mac App Store. It will check for errors. Open the Transporter app > Drag and drop `Dolt Workbench-mac-universal.pkg` file into the Transporter app. If no errors found click the Deliver button to send the app to your developer account.

Go to appstoreconnect.apple.com and click Apps > Dolt Workbench, Click the `+` sign in the left panel to add a new version. Enter the new version number that matches the version in the package.json file. Fill out: What's New in This Version. In the Build section select the build you just submitted (this will take a few minutes to be available after delivered through Transporter) and click Submit for Review.

### Code sign for distributing outside MAC store

We can code sign the `DoltWorkbench-mac-arm64.dmg` file in `dist` and allow people to download it from the release page on Github.

To code sign this file, we will set `SIGNING_CERTIFICATE`, `TEAM_ID`, `APPLE_ID` and `APPLE_ID_PASSWORD` in `web/build/mac/.env` file. To get "APPLE_ID_PASSWORD" in this step, go to your [Apple ID](https://account.apple.com/account/manage), look for the Sign-in and Security section, where you'll find `App-Specific Password`. Create one app-specific password for your app.

![App specific password](../images/app-specific-password.png)

Then run `yarn sign-dmg` from `web`. After this step finished, the dmg file is now fully signed and notarized, ready for distribution.

### Release the Windows App

Submit the `AppX` file at `web/dist` to the store. To submit, choose DoltHub.Inc -> Apps and Games -> Dolt-Workbench to update.

Upload the application `.exe` file to GitHub release for downloading outside the store.

### Release the Linux App

Binaries are located in `web/build/linux`. For ARM64, `dolt-arm64` and for x64, `dolt-x64`. The details for the virtual machine configuration are in [this blog](https://www.dolthub.com/blog/2025-05-29-building-a-linux-electron-app/).
