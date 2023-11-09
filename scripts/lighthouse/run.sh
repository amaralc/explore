pnpm install
pnpm lighthouse https://peerlab.com.br --preset=desktop --output-path=./desktop-report.json --output json
pnpm lighthouse https://peerlab.com.br --form-factor=mobile --output-path=./mobile-report.json --output json
