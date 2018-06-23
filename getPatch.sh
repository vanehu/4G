#!/bin/bash
#   脚本说明
#   获取git提交的new和old文件，文件保存在d盘以第一个参数命名的文件夹下
#
#   参数说明
#   usage getPatch.sh <commit_id> [OPTION]
#   OPTION 可用选项
#    --parents     带目录结构复制文件，文件较多有同名文件时使用
#
#   示例：
#   getPatch.sh develop --parents 带目录结构获取开发分支最新一个提交的new和old文件
#   getPatch.sh develop   不带目录结构获取开发分支最新一个提交的new和old文件
#   getPatch.sh d965e40c  获取提交id为d965e40c的提交的new和old文件

if [ -n "$1" ] ;then

#checkout某次提交
git checkout $1

#建立新旧文件夹
rm -rf /d/$1
mkdir -p /d/$1/new
mkdir -p /d/$1/old

#某次提交的文件列表
git log $1 --oneline --name-only -1|sed -n '2,$p'>flist.tmp

#某次提交的文件列表中修改的文件
git log $1 --oneline --name-status -1|sed -n '2,$p'|sed -n '/^[^A]/'p|awk -F ' ' '{print $2}'>flistm.tmp

#保存指定提交的新增修改文件到new
cat flist.tmp|xargs -i cp $2 {} /d/$1/new/

#获取本次修改的所有文件的上一次提交id
cat flistm.tmp|xargs -i git log -2 --oneline -- {}|awk 'NR%2==0'|awk -F ' ' '{print $1}'|awk '$0=""NR" "$0'>ids.tmp

#添加序号
cat flistm.tmp|awk '$0=""NR" "$0'>files.tmp

#关联提交id与文件名
join ids.tmp files.tmp > merge.tmp
echo "#!/bin/bash">exec.sh

#生成可执行的shell脚本，此脚本检出修改过的文件的上一个版本
cat merge.tmp |cut -d ' ' -f 2,3|sed 's/ / -- /'|sed 's/^/git checkout /'>>exec.sh
./exec.sh

#保存指定提交的修改文件上一个版本到old
cat flistm.tmp|xargs -i cp $2 {} /d/$1/old/

#清理临时生成的文件
rm exec.sh
rm *.tmp

#还原git状态到develop
git reset --hard HEAD
git checkout develop
git status

#如果无参数进行提示
else
    echo "please a patch id"
fi