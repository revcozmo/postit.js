# postit.js

I love notes. Preferably sticky or post-it notes. Sometimes though, these notes
are not sufficient. This is the case when notes are supposed to be long-lived
and shared between my workplace and home. Digital solutions like Evernote exist,
but I could never get used to them. postit.js is my approach to solve this issue
in a nerdy way. If you find postit.js interesting, feel
free to give it a try.

postit.js is incredibly simple: It encrypts each note using GPG and stores it
in separate files. Information about each note (names, tags and modification
date) is currently stored in clear text but may also be encrypted in a
future version. This being said, you won't notice that notes are stored in
an encrypted form. postit.js completely hides this for you.

![postit example](https://raw.github.com/bripkens/postit.js/master/example.gif)

## Installation

postit.js is in a very early stage and will likely evolve over the next few
weeks as I start to actively use it. For this reason, installation requires a
few manual steps.

 1. Clone this repository to your local hard drive. Example:
    `git clone https://github.com/bripkens/postit.js.git`
 2. Download dependencies using `npm install`.
 3. Make the `postit` executable globally accessible. To do so navigate into
    the closed repository and run `npm link`.

You will also need GPG and the `gpg` executable should be on your `PATH`.

## Configuration

Your environments needs to contain the following two variables.

 - **POSTIT_HOME**: postit.js will store notes and meta information in this
   location. You can use a network share or have postit.js
   use Dropbox! Example: `export POSTIT_HOME="$HOME/Dropbox/postit"`.
 - **POSTIT_KEY_ID**: ID of a GPG key that should be used for encryption.
   Please note that postit.js currently only supports keys without passphrases!
   I encourage you to create a new key that you only use for postit.js.
   Example: `export POSTIT_KEY_ID="0xDCDA58618E3E9445"`.

## Usage

Until now postit.js support a few very basic operations.

### Adding a note
```
postit new <a note title>
```

postit.js will automatically open your default editor (by means of the `EDITOR`
environment variable) and, once the editor is closed, will save the note.

### Listing all notes
```
postit ls
```

### Reading a note
```
postit cat <note id>
```

### Editing a note
```
postit edit <note id>
```

### Deleting a note
```
postit rm <note id>
```

## Transfering secret keys between computers

To share keys between computers you have a few simple and secure options.

 1. via USB flash drive or similar
 2. encrypted via email or similar

You can export your key via
`gpg --export-secret-keys $POSTIT_KEY_ID > postit.asc`
and import them on the other computer via
`gpg --allow-secret-key-import --import postit.asc`.
At last, you will also need to assure that the key belongs to you. You can do
this via `gpg --edit $POSTIT_KEY_ID` and the `trust` command.

## TODO

 - provide help on the command line
 - tagging and / or categorization of notes
 - copy to clipboard
 - referring to notes by name or other criteria
 - sorting notes in the overview
 - possibility to set due date
 - full text search (note contents)
 - encrypted meta.json file
