# Insyn Theme for IntelliJ IDEA

This directory contains the native IntelliJ Platform theme plugin. It includes:

- **Insyn**, the restrained blue variant.
- **Insyn Colorful**, the brighter syntax variant.
- Matching editor, console, search, diff, diagnostics, tabs, tool windows, menus, and control colors.

The plugin supports IntelliJ Platform build 233 (IntelliJ IDEA 2023.3) and newer.

## Build without downloading dependencies

JDK 17 or newer and PowerShell are required:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\build.ps1
```

The installable ZIP is written to `build/distributions/`.

## Build or run with Gradle

Open this directory as a Gradle project in IntelliJ IDEA, or run these commands with JDK 21 and Gradle 9 or newer:

```powershell
gradle buildPlugin
gradle runIde
```

The Gradle build downloads an IntelliJ IDEA development instance. The PowerShell build only packages the static theme resources and works offline.

## Install

1. Open **Settings | Plugins**.
2. Use the gear menu and choose **Install Plugin from Disk**.
3. Select `build/distributions/InsynVsTheme-intellij-<version>.zip`.
4. Choose **Insyn** or **Insyn Colorful** under **Settings | Appearance & Behavior | Appearance**.

IntelliJ IDEA uses its native file-type icons. The VS Code-specific icon mappings, Skript TextMate grammar, and highlighted-comment decoration are not part of this theme plugin because those features use editor-specific extension APIs.
