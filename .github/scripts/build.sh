#!/usr/bin/bash

minify=

while [[ $# -gt 0 ]]; do
    case "$1" in
        -m|--minify)
            minify=1
            echo "[build.sh] Using --minify option"
        ;;
        *) echo "Unknown argument: $1" >&2 ;;
    esac
    shift
done

for browser in chrome firefox; do
    suffix="$browser.zip"

    echo "[build.sh] Building the extension for '$browser' browser..."

    if (( minify )); then
        npm run build:$browser:prod
        suffix="$browser.min.zip"
    else
        npm run build:$browser
    fi
    npm run package

    mkdir -p tmp

    zip_file="$(ls dist/Discord-Auto-Quest-v*.zip)"
    mv "$zip_file" "tmp/$(basename "$zip_file" .zip)-$suffix" --verbose
done

mv tmp/Discord-Auto-Quest-*.zip dist/ --verbose
