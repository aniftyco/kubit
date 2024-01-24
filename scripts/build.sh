set -eo pipefail

# These are in order, please don't change
# unless you know what you're doing
PKGS=(
    require-ts 
    fold
    config
    env
    logger
    profiler
    application
    sink
    repl
    core
    assembler
    hash
    events
    drive
    validator
    ace
    http-server
    ioc-transformer
    redis
    view
    i18n
    encryption
    session
    shield
    bodyparser
)

# Clean up old build stuff
echo "Cleaning packages..."
npx del adonis-v5/**/build

# Build new stuff
for package in "${PKGS[@]}"
do
    echo "building ${package}";
    npm -w "@kubit/${package}" run build;
done