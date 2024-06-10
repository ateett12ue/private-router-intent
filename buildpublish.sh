#!/bin/bash
#tag=1.0.1-50-g454fgf
tag=`git describe --dirty`
delimiter="-"
declare -a array=($(echo $tag | tr "$delimiter" " "))
currentversion=${array[0]}

commitnumber=0
commitnumbertemp=${array[1]}

if [ -z "$commitnumbertemp" ]
then
      commitnumnber=0
else
      commitnumber=${array[1]}
fi

exversion=${array[0]}
delimiter2="."
declare -a array2=($(echo $exversion | tr "$delimiter2" " "))
major=${array2[0]}
minor=${array2[1]}
build=${array2[2]}

#echo 'current version :'$currentversion
#echo 'Major : '$major
#echo 'Minor : '$minor
#echo 'Build : '$build
#echo 'LastCommitsCount : '$commitnumber
newbuild=`expr $build + $commitnumber`
#echo 'NewBuildNo : '$newbuild

if [ $newbuild -gt 50 ]
then
     minortemp=`expr $minor + 1`
     if [ $minortemp -gt 50 ]
     then
	 major=`expr $major + 1`
         minor=0
         build=0
     else
         minor=`expr $minor + 1`
         build=0
     fi
else
    build=$newbuild
fi

newversion=$major'.'$minor'.'$build
buildfilename='build.v'$newversion'.zip'

buildfolder="build.v"$newversion

if [ -d $buildfolder ]
then
    rm -rf $buildfolder
    mkdir $buildfolder
else
    mkdir $buildfolder
fi

#cp -r ./dist ./$buildfolder
#cp ./{package.json,package-lock.json,.env.dev,.env.staging,.env.live,appspec.yml} ./$buildfolder

#1. Make a folder called build
#2. Copy everything required to generate the workable build folder
#3  Zip the build folder as below instead of dist
zip -r $buildfilename appspec.yml package.json package-lock.json .env.dev .env.staging .env.live appspec.yml ./scripts ./dist