echo '#!/usr/bin/env node' | cat - dist/cli_getAllInAlbum.js > temp
mv temp dist/cli_getAllInAlbum.js
chmod +x dist/cli_getAllInAlbum.js