#!/usr/bin/env bash

set -Eeuo pipefail

minify=0

while [[ $# -gt 0 ]]; do
    case "$1" in
        -m|--minify)
            minify=1
            echo "[build.sh] Using --minify option"
            ;;
        *)
            echo "[build.sh] Unknown argument: $1" >&2
            exit 1
            ;;
    esac
    shift
done

# Prepare temporary directory
rm -rf tmp
mkdir -p tmp

shopt -s nullglob

for browser in chrome firefox; do
    build_cmd="build:$browser"
    package_cmd="package"
    suffix="$browser"

    if (( minify )); then
        build_cmd="build:$browser:prod"
        [[ "$browser" != chrome ]] && package_cmd="package:flat"
        suffix="$browser.min"
    fi

    echo "[build.sh] Building the extension for '$browser' browser..."

    [[ -d dist/ ]] && rm -f dist/Discord-Auto-Quest-v*.zip
    npm run "$build_cmd"
    npm run "$package_cmd"

    # Find generated ZIP
    zip_files=(dist/Discord-Auto-Quest-v*.zip)

    if (( ${#zip_files[@]} != 1 )); then
        echo "[build.sh] Expected exactly one ZIP file, found ${#zip_files[@]}" >&2
        exit 1
    fi

    zip_file="${zip_files[0]}"
    filename="$(basename "$zip_file" .zip)"

    mv --verbose -- "$zip_file" "tmp/$filename-$suffix.zip"
done

# Move final artifacts into dist
mv --verbose -- tmp/*.zip dist/

echo "[build.sh] Build completed successfully!"
