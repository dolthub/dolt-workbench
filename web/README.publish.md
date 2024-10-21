Release and update for Mac:

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

3. Install dependencies in root:

```bash
# in the root directory of the repo
yarn
```

4. Build the package

```bash
# in the root directory of the repo
yarn build
```

The builds will show up in `dist` folder, including a `Dolt Workbench-mac-arm64.dmg` file, a `mac-arm64` folder and a `mas-universal` folder. Inside the `mac-arm64` folder is the app that you can run locally.

### Submit to MAC store

We will only use `mas-universal` folder for submitting to MAC store. There will be a `Dolt Workbench.app` application file and a `Dolt Workbench-mac-universal.pkg` installer file inside it. These files could not be used locally, they are for MAC store submission, when double clicking on them, it will show as "could not be opened", this is expected because they are packed in sandbox and need to be signed by Apple before distribution.

The preferred tool to submit is the [Transporter app](https://apps.apple.com/us/app/transporter/id1450874784) which can be downloaded free from the Mac App Store.It will check for errors. Open the Transporter app > Drag and drop `Dolt Workbench-mac-universal.pkg` file into the Transporter app. If no errors found click the Deliver button to send the app to your developer account.

Go to appstoreconnect.apple.com and click Apps > Dolt Workbench, Click the `+` sign in the left panel to add a new version. Enter the new version number that matches the version in the package.json file. Fill out: What's New in This Version. In the Build section select the build you just submitted (this will take a few minutes to be available after delivered through Transporter) and click Submit for Review.

### Code sign for distributing outside MAC store

We can code sign the `Dolt Workbench-mac-arm64.dmg` file and allow people to download it from the release page on Github.

Sign the DMG file using your Developer ID Application certificate:

```bash
cd dist
codesign --force --verify --verbose --sign "Developer ID Application: Your Name (Team ID)" Dolt\ Workbench-mac-arm64.dmg
```

To ensure it’s properly signed, run:

```bash
codesign -vvv Dolt\ Workbench-mac-arm64.dmg
```

You should see after running the command:

```bash
Dolt Workbench-mac-arm64.dmg: valid on disk
Dolt Workbench-mac-arm64.dmg: satisfies its Designated Requirement
```

You will need "App Specific Passwords" in this step. Go to [Apple ID](https://account.apple.com/account/manage), in Sign-in and Security section, find `App-Specific Password`. Create one app-specific password for your app.

![App specific password](../images/app-specific-password.png)

Submit the app to Apple’s notarization service.

```bash
xcrun notarytool submit Dolt\ Workbench-mac-arm64.dmg   --apple-id "your-apple-id" --password "your-app-specific-password" --team-id "your-team-id" --wait
```

This step will take some time, you will see `Accepted` if all goes well.

```bash
Conducting pre-submission checks for Dolt\ Workbench-mac-arm64.dmg   and initiating connection to the Apple notary service...
Submission ID received
  id: your-app-submission-id
Upload progress: 100.00% (176 MB of 176 MB)
Successfully uploaded file
  id: your-app-submission-id
  path: /path/to/Dolt Workbench-mac-arm64.dmg
Waiting for processing to complete.
Current status: Accepted...........................................
Processing complete
  id: your-app-submission-id
  status: Accepted
```

Once the notarization process is successful, staple the notarization ticket to the app:

```bash
xcrun stapler staple Dolt\ Workbench-mac-arm64.dmg
```

The output should be:

```bash
Processing: /path/to/Dolt Workbench-mac-arm64.dmg
Processing: /path/to/Dolt Workbench-mac-arm64.dmg
The staple and validate action worked!
```

The app is now fully signed and notarized, ready for distribution.
