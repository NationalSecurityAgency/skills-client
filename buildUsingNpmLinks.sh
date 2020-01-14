#!/usr/bin/env bash

projectsTo=( "skills-client-configuration" "skills-client-reporter" "skills-client-js" "skills-client-react" "skills-client-vue")
projectsFrom=($(ls | grep skills-example-client))
currentDir=`pwd`

allProjects=()
for proj in "${projectsTo[@]}"; do allProjects+=($proj); done
for proj in "${projectsFrom[@]}";  do allProjects+=($proj); done

function preformLinking {
    fromProjPath=${1}
    for projTo in "${projectsTo[@]}"
    do
        catRes=`cat ${fromProjPath}/package.json | grep "@skills/${projTo}"`
        if [ ! -z "$catRes" ] && [ -z `echo "$fromProjPath" | grep ${projTo}` ];
        then
            echo "Linking ${fromProjPath} => @skills/${projTo}"
            echo "Exec: cd ${fromProjPath}"
            cd ${fromProjPath}
            echo "Exec: npm prune"
            npm prune
            echo "Exec: npm link @skills/${projTo}"
            npm link @skills/${projTo}
        fi
    done
}

echo "-------- npm prune and npm install for all projects --------"
for proj in "${allProjects[@]}"
do
    cd ../${proj}
    echo "npm prune and install `pwd`"
    npm prune
    npm install
done

echo "-------- Creating Links --------"
for proj in "${projectsTo[@]}"
do
	cd ../${proj}
    echo "Creating link in `pwd`"
    npm link
done

echo "-------- Linking --------"
for projFrom in "${projectsFrom[@]}"
do
    preformLinking "${currentDir}/${projFrom}"
done

for projFrom in "${projectsTo[@]}"
do
    preformLinking "${currentDir}/../${projFrom}"
done

echo "-------- Building --------"
for proj in "${allProjects[@]}"
do
    cd $currentDir
    cd ../$proj
    npm run build
done

#echo "-------- Install skills-examples --------"
#cd $currentDir
#mvn install
