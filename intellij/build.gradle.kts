plugins {
    id("org.jetbrains.intellij.platform") version "2.18.1"
}

group = "dev.insanmiy"
version = "2.1.4"

repositories {
    mavenCentral()
    intellijPlatform {
        defaultRepositories()
    }
}

dependencies {
    intellijPlatform {
        intellijIdea("2025.2.6.2")
    }
}

intellijPlatform {
    pluginConfiguration {
        ideaVersion {
            sinceBuild = "233"
            untilBuild = provider { null }
        }
    }
}
