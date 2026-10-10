# InsynVsTheme

![InsynVsTheme Icon](images/icon.png)

InsynVsTheme Is A Dark Navy And Pure Black Theme For Visual Studio Code And IntelliJ IDEA.

## Themes

### Dark Themes

Insyn Blue Midnight: Original Navy Theme With Blue Syntax.

Insyn Blackout: Pitch Black Theme With Blue Syntax.

Insyn Vivid: Navy Theme With Bright Syntax.

Insyn Hyper: Pitch Black Theme With High Contrast Syntax.

### Light Themes

Insyn Light Blue: Pure White Theme With Deep Navy And Blue Syntax.

Insyn Vivid Light: Crisp White Theme With Vibrant Multi Color Syntax.

Insyn Light Flare: High Contrast Crisp White Theme With Bold Colorful Syntax.

## File Icons

Insyn File Icons And Insyn Colorful Icons.

## Building For Visual Studio Code

Requirements: Node.js

Run The Package Command In The Root Folder:

```powershell
npx @vscode/vsce package
```

The Output File Is A Vsix File In The Root Folder.

To Install In Visual Studio Code Open Extensions Click The Three Dots Menu And Select Install From VSIX.

## Building For IntelliJ IDEA

Requirements: Java 17 Or Newer And PowerShell

Run The PowerShell Script In The IntelliJ Folder:

```powershell
cd intellij
powershell -ExecutionPolicy Bypass -File .\build.ps1
```

Or Build Using Gradle:

```powershell
cd intellij
gradle buildPlugin
```

The Output File Is A Zip File Inside build/distributions/.

To Install In IntelliJ IDEA Open Settings Go To Plugins Click The Gear Icon And Select Install Plugin From Disk.

## License

See [LICENSE](LICENSE).
