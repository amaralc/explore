#!/bin/bash

# Install nvm and setup node version according to .nvmrc
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | NVM_DIR="$HOME/.nvm" bash -s -- --no-color --skip-extra-prompts

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Install node version from .nvmrc
nvm install

# Enable corepack (https://nodejs.org/api/corepack.html)
corepack enable

# Install package manager
corepack install

# Install dependencies using corepack
corepack pnpm install
