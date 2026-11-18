const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

module.exports = function withOptimizedBuild(config) {
  // 1. Enable R8, Proguard, and resource shrinking in gradle.properties
  config = withGradleProperties(config, (cfg) => {
    cfg.modResults.push(
      { type: 'property', key: 'android.enableProguardInReleaseBuilds', value: 'true' },
      { type: 'property', key: 'android.enableShrinkResourcesInReleaseBuilds', value: 'true' },
      { type: 'property', key: 'android.enableR8.fullMode', value: 'true' }
    );
    return cfg;
  });

  // 2. Add ndk abiFilters to remove x86 and x86_64 PC emulator libraries (cuts ~40 MB)
  config = withAppBuildGradle(config, (cfg) => {
    let contents = cfg.modResults.contents;
    if (!contents.includes('abiFilters')) {
      contents = contents.replace(
        /defaultConfig\s*\{/,
        `defaultConfig {
        ndk {
            abiFilters "arm64-v8a", "armeabi-v7a"
        }`
      );
    }
    cfg.modResults.contents = contents;
    return cfg;
  });

  return config;
};
