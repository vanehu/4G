#!/bin/bash
if [ -n "$1" ] ;then
git checkout $1
rm -rf /d/$1
mkdir -p /d/$1/new
mkdir -p /d/$1/old
git log $1 --oneline --name-only -1|sed -n '2,$p'|xargs -i cp --parents {} /d/$1/new/
git log $1 --oneline --name-only -1|sed -n '2,$p'|xargs -i git log -2 --oneline -- {}|awk 'NR%2==0'|awk -F ' ' '{print $1}'|awk '$0=""NR" "$0'>ids.tmp
git log $1 --oneline --name-only -1|sed -n '2,$p'|awk '$0=""NR" "$0'>files.tmp
join ids.tmp files.tmp > merge.tmp
echo "#!/bin/bash">exec.sh
cat merge.tmp |cut -d ' ' -f 2,3|sed 's/ / -- /'|sed 's/^/git checkout /'>>exec.sh
./exec.sh
git log $1 --oneline --name-only -1|sed -n '2,$p'|xargs -i cp --parents {} /d/$1/old/
rm exec.sh
rm *.tmp
git checkout develop
git status
else
    echo "please a patch id"
fi