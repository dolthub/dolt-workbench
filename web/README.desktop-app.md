Prerequisite:
Download Dolt binaries from the [latest release](https://github.com/dolthub/dolt/releases/latest).

- For macOS, place the dolt binary in web/build/mac.
- For Windows, place the dolt.exe binary in web/build/appx.

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

## Release and update for Mac:

### Prerequisite

- You need a developer account and contact tim for access.
- Download the provision profiles and install the certificates from Apple connect, instructions in this blog: https://www.dolthub.com/blog/2024-10-02-how-to-submit-an-electron-app-to-mac-app-store/#generate-provisioning-profiles

### Build the package

1. Fetch the changes from [workbench repo](https://github.com/dolthub/dolt-workbench), merge the changes into your local [desktop repo](https://github.com/dolthub/dolt-workbench-desktop)

2. Install dependencies and build in the `graphql-server` directory:

```bash
# in `graphql-server`
yarn
yarn build
```

3. Install dependencies in web:

```bash
# in web
yarn
```

4. download the latest dolt binaries:

```bash
# in web
yarn download:dolt
```

5. Build the package

To build for MAC store:

```bash
# in web
yarn build:mas
```

To build the package outside MAC store:

```bash
# in web
yarn build:dmg
```

On a Windows computer, build the windows app:

```bash
# in web
yarn build:win
```

### Submit to MAC store

We will only use `mas-universal` folder for submitting to MAC store. There will be a `Dolt Workbench.app` application file and a `Dolt Workbench-mac-universal.pkg` installer file inside it. These files could not be used locally, they are for MAC store submission, when double clicking on them, it will show as "could not be opened", this is expected because they are packed in sandbox and need to be signed by Apple before distribution.

The preferred tool to submit is the [Transporter app](https://apps.apple.com/us/app/transporter/id1450874784) which can be downloaded free from the Mac App Store.It will check for errors. Open the Transporter app > Drag and drop `Dolt Workbench-mac-universal.pkg` file into the Transporter app. If no errors found click the Deliver button to send the app to your developer account.

Go to appstoreconnect.apple.com and click Apps > Dolt Workbench, Click the `+` sign in the left panel to add a new version. Enter the new version number that matches the version in the package.json file. Fill out: What's New in This Version. In the Build section select the build you just submitted (this will take a few minutes to be available after delivered through Transporter) and click Submit for Review.

### Code sign for distributing outside MAC store

We can code sign the `Dolt Workbench-mac-arm64.dmg` file and allow people to download it from the release page on Github.

To code sign the file, we will set `SIGNING_CERTIFICATE`, `TEAM_ID`, `APPLE_ID` and `APPLE_ID_PASSWORD` in `web/build/mac/.env` file. To get "APPLE_ID_PASSWORD" in this step. Go to [Apple ID](https://account.apple.com/account/manage), in Sign-in and Security section, find `App-Specific Password`. Create one app-specific password for your app.

![App specific password](../images/app-specific-password.png)

Then run `yarn sign-dmg` from `web`. After this step finished, the dmg file is now fully signed and notarized, ready for distribution.

### Release the Windows App

Submit the `AppX` file to the store. Upload the `.exe` file to GitHub release for downloading outside the store.
