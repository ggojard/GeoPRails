#!/bin/bash

contains() {
  [[ $1 =~ $2 ]] && exit 0 || exit 1
}

sites="demo amf acf hi bouygues volkswagen heineken sodexo"

deply_site(){

  echo "load <$1> in <$sites>"

  if (contains "$sites" $1 -eq 0); then
    site="surfy$1"
    echo "deploy <$site>"
    git push origin master && git push $site master && heroku run rake db:migrate --app $site
  else
    echo "site <$1> not found"
  fi
}

for s in $1 
do
  deply_site "$s"
done


