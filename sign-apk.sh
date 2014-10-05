#!/bin/bash
cd platforms/android/ant-build
rm mMind.apk
zipalign -v 4 mMind-release-unsigned.apk mMind.apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore /home/marco/dev/keystore/mfx.keystore mMind.apk android
