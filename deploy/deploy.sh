#!/bin/bash

contains() {
  [[ $1 =~ $2 ]] && exit 0 || exit 1
}

sites="geopapp demo amf acf hi bouygues volskwagen heineken"
echo "load <$1> in <$sites>"

if (contains "$sites" $1 == 0); then
  site="surfy$1"
  echo "deploy <$site>"
  git push origin master && git push $site master && heroku run rake db:migrate --app $site
else
  echo "site <$1> not found"
fi
