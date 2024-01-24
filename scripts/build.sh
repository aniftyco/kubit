set -eo pipefail

# These are in order, please don't change
# unless you know what you're doing
PKGS=(
    require-ts 
    sink
    assembler
    config
    profiler
    application
    env
    fold
    hash
    repl
    events
    drive
    validator
    ace
    http-server
    core
    logger
    ioc-transformer
    redis
    view
    i18n
    encryption
    session
    shield
    bodyparser
)

for package in "${PKGS[@]}"
do
    echo "building ${package}";
    npm -w "@kubit/${package}" run build;
done
