# postit.js

## Installation

## Configuration

Your environments needs to contain the following two variables.

 - **POSTIT_HOME**: postit.js will store notes and meta information in this
   location. You can use a network share or have postit.js
   use Dropbox! Example: `export POSTIT_HOME="$HOME/Dropbox/postit"`.
 - **POSTIT_KEY_ID**: ID of a GPG key that should be used for encryption.
   Please note that postit.js currently only supports keys without passphrases!
   I encourage you to create a new key that you only use for postit.js.
   Example: `export POSTIT_KEY_ID="0xDCDA552A8E3E9445"`.
