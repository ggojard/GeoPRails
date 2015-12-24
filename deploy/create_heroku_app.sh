#!/bin/bash

name="$1"
s="surfy${name}"

echo "create site app ${s}"
# heroku apps:destroy $s
heroku apps:create --region eu $s
heroku domains:add ${name}.surfy.pro --app $s
git remote add $s https://git.heroku.com/$s.git

heroku addons:create heroku-postgresql:hobby-dev --app $s

heroku addons:create cloudinary --app $s
heroku config:set CLOUDINARY_URL=$2 --app $s

# CLOUDINARY_URL=cloudinary://946599992989832:t0cdEWRP_TtWswFkBxlKYKGAKiA@site-blablacar
# CLOUDINARY_URL=cloudinary://252349323969378:NlDQ-pUSgloHXWIJtj7g0Ejo9gw@surfy-isagri
# CLOUDINARY_URL=cloudinary://573753184926623:rVgDn3oMV6TXoWHgy2tDi5Df4oA@surfy-amf
# https://portal.office.com/admin/default.aspx#ActiveUsersPage

# ./deploy/deploy.sh $name

echo "transfer database from surfyroot"
heroku pg:copy surfyroot::DATABASE DATABASE -a $s --confirm $s


