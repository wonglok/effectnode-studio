# React + Electron

A create-react-app & Electron simple example.

Install deps
`yarn install`

## Scripts

`yarn start` will start the Electron app and the React app at the same time.
`yarn build` will build the React app and package it along the Electron app.

## Deploy Github

see `https://github.com/settings/tokens`

```
export GH_TOKEN="your github token"
yarn deploy
```

Then validate your release here:

`https://github.com/alagrede/react-electron-example/releases`

## Generate icons

see: [electron-builder icons](https://www.electron.build/icons)

### Mac

**icns**

```
cd assets/bin
python3 ../../scripts/generate-iconset.py icon.png
```

### Win

**ico** (with imagemagick `brew install imagemagick`)

```
cd assets/bin/icon.iconset
convert icon_16x16.png icon_32x32.png icon_64x64.png icon_128x128.png icon_256x256.png icon.ico
mv icon.ico ../
```

## Auto update

see [electron update](https://www.electronjs.org/docs/tutorial/updates)
Currently a 1.0.0 release is deployed for demo

- set package.json `version: 0.9.0`
- Build and install app with dmg
- Once app is installed, wait update popup and restart app
