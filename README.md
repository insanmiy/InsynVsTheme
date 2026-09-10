# InsynVsTheme

![InsynVsTheme icon](images/icon.png)

InsynVsTheme is my navy Visual Studio Code setup.

An IntelliJ IDEA version is also available in [`intellij`](intellij).

## Enable the theme

Select the color theme (**InsynVsTheme** or **InsynVsTheme Colorful**) and the matching file icon theme (**Insyn File Icons** or **Insyn Colorful Icons**) from the Preferences menu.


### IntelliJ IDEA

Build the IntelliJ plugin with:

```powershell
cd intellij
Set-ExecutionPolicy -Scope Process Bypass
.\build.ps1
```

Then open **Settings | Plugins**, choose **Install Plugin from Disk**, and select the ZIP from `intellij/build/distributions/`. The IntelliJ plugin supports IntelliJ IDEA 2023.3 and newer.

## License

See [LICENSE](LICENSE).
