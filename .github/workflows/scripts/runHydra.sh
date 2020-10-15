#!/bin/bash
# exit if a command returns non-zero exit code
set -e
set -o pipefail

DB=${DB:-postgres}
TRACING=${TRACING:-false}
PROMETHEUS=${PROMETHEUS:-false}
echo "PWD: "
echo $(pwd)
cd ./skills-client-integration/skills-int-e2e-test/hydra
DC="docker-compose -f quickstart.yml"
if [[ $DB == "mysql" ]]; then
    DC+=" -f quickstart-mysql.yml"
fi
if [[ $DB == "postgres" ]]; then
    DC+=" -f quickstart-postgres.yml"
fi
if [[ $TRACING == true ]]; then
    DC+=" -f quickstart-tracing.yml"
fi
if [[ $PROMETHEUS == true ]]; then
    DC+=" -f quickstart-prometheus.yml"
fi
DC+=" up --build -d"

$DC

echo 'Waiting for hydra service...'
#timeout 22 bash -c 'until printf "" 2>>/dev/null >>/dev/tcp/$0/$1; do sleep 1; done' 127.0.0.1 4445
timeout 22 bash -c 'until nc -z $0 $1; do sleep 1; done' 127.0.0.1 4445
echo 'Creating skilltree-test client...'
export COMPOSE_INTERACTIVE_NO_CLI=1
docker-compose -f quickstart.yml exec -T hydra \
	hydra clients create \
    --endpoint http://localhost:4445/ \
    --id skilltree-test \
    --secret client-secret \
    --grant-types authorization_code,refresh_token \
    --response-types code \
    --scope openid \
    --callbacks http://localhost:8080/login/oauth2/code/hydra
echo 'Done.'
