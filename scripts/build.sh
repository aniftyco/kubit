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
    hash
    events
    encryption
    http-server
    drive
    ace
    bodyparser
    validator
    core
    assembler
    repl
    ioc-transformer
    redis
    view
    i18n
    session
    shield
)

# Build new stuff
for package in "${PKGS[@]}"
do
    echo "building ${package}";
    npm -w "@kubit/${package}" run clean;
    npm -w "@kubit/${package}" run build;
done