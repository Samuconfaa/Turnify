/**
 * Config plugin: forza android:gravity="fill" nel drawable dello splash screen.
 * Necessario perché expo-splash-screen@56 hardcoda "center" ignorando resizeMode:"cover".
 */
const { withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const withSplashCover = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const drawablePath = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/res/drawable/splashscreen_background.xml'
      );

      // Il file generato da expo-splash-screen si chiama splashscreen_background.xml
      // oppure è inline nel layer-list dentro ic_launcher_background.xml.
      // Cerchiamo tutti i file drawable che contengono il bitmap dello splash.
      const resDir = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/res/drawable'
      );

      const files = fs.readdirSync(resDir);
      for (const file of files) {
        const filePath = path.join(resDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('splashscreen_logo') && content.includes('android:gravity="center"')) {
          content = content.replace(
            /android:gravity="center"/g,
            'android:gravity="fill"'
          );
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`[withSplashCover] patched ${file}: gravity center → fill`);
        }
      }

      return config;
    },
  ]);
};

module.exports = withSplashCover;
