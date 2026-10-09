# InsynVsTheme

![InsynVsTheme Icon](images/icon.png)

InsynVsTheme is a dark, modern theme suite crafted for Visual Studio Code and IntelliJ IDEA.

## Themes Included

### Color Themes

- **InsynVsTheme**: The original deep navy (`#030812`) theme with restrained, focused blue syntax.
- **InsynVsTheme Colorful**: The deep navy background paired with vibrant, distinct syntax colors across languages.
- **InsynVsTheme Colorful V2**: A solid pure-black (`#000000`) background paired with high-contrast, bold syntax highlighting.

### File Icon Themes

- **Insyn File Icons**: Clean, monochrome file and folder icons tuned to the theme palette.
- **Insyn Colorful Icons**: Vibrant, full-color icons with custom shapes for hundreds of extensions and filenames.

### Additional Features

- **Skript Language Support**: Built-in syntax highlighting for Minecraft Skript, including in-editor preview colors for Minecraft color codes (`&0` through `&f`) and format codes (`&l`, `&o`, `&n`, `&m`, `&k`, `&r`).
- **Highlighted Comment Lines**: Bright comment highlighting triggered by `//.` and `#.`.

---

## IntelliJ IDEA

A native IntelliJ Platform plugin is available in [`intellij`](intellij). It brings matching themes to IntelliJ IDEA (2023.3 and newer):

- **Insyn**
- **Insyn Colorful**
- **Insyn Colorful V2**

### Build the IntelliJ Plugin

Run the PowerShell build script from the `intellij` directory:

```powershell
cd intellij
Set-ExecutionPolicy -Scope Process Bypass
.\build.ps1
```

Or build with Gradle:

```powershell
cd intellij
gradle buildPlugin
```

The installable plugin ZIP will be generated in `intellij/build/distributions/`.

### Install in IntelliJ IDEA

1. Open **Settings | Plugins** (or **Preferences | Plugins** on macOS).
2. Click the gear icon and select **Install Plugin from Disk...**.
3. Select the generated ZIP from `intellij/build/distributions/`.
4. Choose **Insyn**, **Insyn Colorful**, or **Insyn Colorful V2** under **Settings | Appearance & Behavior | Appearance**.

---

## License

See [LICENSE](LICENSE).
