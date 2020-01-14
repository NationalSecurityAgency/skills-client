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
            echo "------------------------------------------------------------"
            echo "--- Linking ${fromProjPath} => @skills/${projTo} ---"
            echo "------------------------------------------------------------"
            echo "   Exec: cd ${fromProjPath}"
            cd ${fromProjPath}
#            echo "   Exec: npm prune"
#            npm prune
            echo "   Exec: npm link @skills/${projTo}"
            npm link @skills/${projTo}
        fi
    done
}

function npmInstall {
    cd ${1}
    echo "------------------------------------------------------------"
    echo "--- npm prune and install `pwd` ---"
    echo "------------------------------------------------------------"
    npm prune
    npm install
}
echo "------------------------------------------------------------"
echo "-------- npm prune and npm install for all projects --------"
echo "------------------------------------------------------------"
for proj in "${projectsTo[@]}";
do
    cd $currentDir
    npmInstall "../${proj}";
done
for proj in "${projectsFrom[@]}";
do
    cd $currentDir
    npmInstall "./${proj}";
done


echo "------------------------------------------------------------"
echo "-------- Creating Links --------"
echo "------------------------------------------------------------"
for proj in "${projectsTo[@]}"
do
	cd ../${proj}
    echo "------------------------------------------------------------"
    echo "--- Creating link in `pwd` ---"
    echo "------------------------------------------------------------"
    npm link
done

echo "------------------------------------------------------------"
echo "-------- Linking --------"
echo "------------------------------------------------------------"
for projFrom in "${projectsFrom[@]}"
do
    preformLinking "${currentDir}/${projFrom}"
done

for projFrom in "${projectsTo[@]}"
do
    preformLinking "${currentDir}/../${projFrom}"
done

echo "------------------------------------------------------------"
echo "-------- Building --------"
echo "------------------------------------------------------------"
for proj in "${projectsTo[@]}"
do
    cd $currentDir
    cd ../$proj
    echo "------------------------------------------------------------"
    echo "--- npm run build `pwd` ---"
    echo "------------------------------------------------------------"
    npm run build
done

for proj in "${projectsFrom[@]}"
do
    cd $currentDir
    cd $proj
    echo "------------------------------------------------------------"
    echo "--- npm run build `pwd` ---"
    echo "------------------------------------------------------------"
    npm run build
done
