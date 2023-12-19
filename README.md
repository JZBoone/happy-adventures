# Happy Adventures

This is a project inspired by https://vim-adventures.com/ and my daughter.

To run the app locally:

1. Install the version of node js specified in `./nvmrc`
2. Run `npm ci`
3. Run `npm start`
4. Go to localhost:3000

To load the deployed version of the app visit:

https://storage.googleapis.com/happy-adventures/index.html

This app is built on https://phaser.io/ and is configured to run on an up-to-date version of Chrome. It requires a keyboard to play (specifically the arrow keys).

When running the app locally you can type `e` to edit the current level. This launches the map builder which has the following features:

- **up, down, left, right** - move camera
- **o** - zoom out
- **i** - zoom in
- **right click** - change the ground type
- **left click and drag (tile with no objects)** - change the ground type to match the tile that you clicked
- **left click and drag an object** - move an object
- **alt/option + left click and drag an object** - clone an object (works only for objects that are part of a group)
- **left click + d on an object** - delete an object (works only for objects that are part of a group)
- **shift + click on a talking object** - edit the message (in dialog press **enter** to save or **escape** to exit without saving)
- **s** - save changes to map (updates the map and map objects json files locally)
- **shift + T** - make map taller by one row
- **shift + W** - make map wider by one row
- **escape** - exit map builder and return to level (discards unsaved changes)
