import { workbenchGithubRepo } from "@lib/constants";
import {
  shell,
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  app,
} from "electron";

export function initMenu(
  win: BrowserWindow,
  isProd: boolean,
  hasChosenDatabase?: boolean,
): Menu {
  var applicationMenu: MenuItemConstructorOptions[] = [
    {
      label: "Edit",
      submenu: [
        {
          type: "separator",
        },
        {
          role: "cut",
        },
        {
          role: "copy",
        },
        {
          role: "paste",
        },
        {
          role: "pasteAndMatchStyle",
        },
        {
          role: "delete",
        },
        {
          role: "selectAll",
        },
      ],
    },
    {
      label: "View",
      submenu: [
        isProd
          ? { label: "hidden", visible: false }
          : {
              label: "Reload",
              accelerator: "CmdOrCtrl+R",
              click(_item, focusedWindow) {
                if (focusedWindow) (focusedWindow as BrowserWindow).reload();
              },
            },
        isProd
          ? { label: "hidden", visible: false }
          : {
              type: "separator",
            },
        {
          role: "resetZoom",
        },
        {
          role: "zoomIn",
        },
        {
          role: "zoomOut",
        },
        {
          type: "separator",
        },
        {
          role: "togglefullscreen",
        },
      ],
    },
    {
      label: "Tools",
      submenu: [
        isProd
          ? { label: "hidden", visible: false }
          : {
              label: "Toggle Developer Tools",
              accelerator:
                process.platform === "darwin"
                  ? "Alt+Command+I"
                  : "Ctrl+Shift+I",
              click(_item, focusedWindow) {
                if (focusedWindow)
                  (focusedWindow as BrowserWindow).webContents.toggleDevTools();
              },
            },
        isProd
          ? { label: "hidden", visible: false }
          : {
              type: "separator",
            },
        {
          label: "Import File",
          accelerator: "CmdOrCtrl+I",
          click: () => win.webContents.send("menu-clicked", "upload-file"),
          enabled: hasChosenDatabase,
        },
        {
          type: "separator",
        },
        {
          label: "Commit Graph",
          accelerator: "CmdOrCtrl+G",
          click: () => win.webContents.send("menu-clicked", "commit-graph"),
          enabled: hasChosenDatabase,
        },
        {
          type: "separator",
        },
        {
          label: "Schema Diagram",
          accelerator: "CmdOrCtrl+D",
          click: () => win.webContents.send("menu-clicked", "schema-diagram"),
          enabled: hasChosenDatabase,
        },
        {
          type: "separator",
        },
        {
          label: "New...",
          submenu: [
            {
              label: "Table",
              accelerator: "CmdOrCtrl+T",
              click: () => win.webContents.send("menu-clicked", "new-table"),
              enabled: hasChosenDatabase,
            },
            {
              type: "separator",
            },
            {
              label: "Branch",
              accelerator: "CmdOrCtrl+B",
              click: () => win.webContents.send("menu-clicked", "new-branch"),
            },
            {
              type: "separator",
            },
            {
              label: "Release",
              // accelerator: "CmdOrCtrl+R",
              click: () => win.webContents.send("menu-clicked", "new-release"),
            },
          ],
          enabled: hasChosenDatabase,
        },
        {
          type: "separator",
        },
        {
          label: "Run Query",
          accelerator: "CmdOrCtrl+Q",
          click: () => win.webContents.send("menu-clicked", "run-query"),
          enabled: hasChosenDatabase,
        },
      ],
    },
    {
      role: "window",
      submenu: [
        {
          role: "minimize",
        },
      ],
    },
    {
      role: "help",
      submenu: [
        {
          label: "Documentation",
          click() {
            shell.openExternal("https://docs.dolthub.com/");
          },
        },
        {
          label: "View on GitHub",
          click() {
            shell.openExternal(workbenchGithubRepo);
          },
        },
      ],
    },
  ];

  const name = app.getName();
  applicationMenu.unshift({
    label: name,
    submenu: [
      {
        role: "about",
      },
      {
        type: "separator",
      },
      {
        role: "services",
        submenu: [],
      },
      {
        type: "separator",
      },
      {
        role: "hide",
      },
      {
        role: "hideOthers",
      },
      {
        role: "unhide",
      },
      {
        type: "separator",
      },
      {
        role: "quit",
      },
    ],
  });

  return Menu.buildFromTemplate(applicationMenu);
}
