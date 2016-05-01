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
# heroku config:set CLOUDINARY_URL=$2 --app $s
heroku config:set CLOUDINARY_URL=cloudinary://994285314949724:igUQI-fJVuRk0CwipE07siNMgqc@surfydemo --app $s

# cloudinary://994285314949724:igUQI-fJVuRk0CwipE07siNMgqc@surfydemo
# CLOUDINARY_URL=cloudinary://946599992989832:t0cdEWRP_TtWswFkBxlKYKGAKiA@site-blablacar
# CLOUDINARY_URL=cloudinary://252349323969378:NlDQ-pUSgloHXWIJtj7g0Ejo9gw@surfy-isagri
# CLOUDINARY_URL=cloudinary://573753184926623:rVgDn3oMV6TXoWHgy2tDi5Df4oA@surfy-amf
# CLOUDINARY_URL=cloudinary://417584825955111:3kvrESi5v7lyFW3r0HLt4tjqVtc@surfy-volkswagen
# https://portal.office.com/admin/default.aspx#ActiveUsersPage

heroku buildpacks:set 'git://github.com/qnyp/heroku-buildpack-ruby-bower.git#run-bower' --app $s

# CLOUDINARY_URL=cloudinary://376526364735813:xmbolDN7jkqcPDSSkvi-xr5VuS0@surfy-test

./deploy/deploy.sh $name

echo "transfer database from surfyroot"
heroku pg:copy surfyroot::DATABASE DATABASE -a $s --confirm $s
# heroku pg:copy surfymdm::DATABASE DATABASE -a $s 
# --confirm $s


heroku pg:copy surfyroot::DATABASE DATABASE -a surfyhello2 --confirm surfyhello2


# build_9c938d881951fe6da344851073cf5ae8
