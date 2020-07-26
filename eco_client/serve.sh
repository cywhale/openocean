#!/bin/bash
export PORT=3000 && yarn dev --https --cert ./fullchain.pem --key ./privkey.pem --config config/preact.config.js
