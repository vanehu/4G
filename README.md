<center>集团LTE-4G 验证库</center>
===========================
Git global setup
----------------
```
git config --global user.name "liuteng"
git config --global user.email "liuteng@asiainfo.com"
```

Create a new repository
-----------------------
```
git clone http://liuteng@git.asiainfo.org/liuteng/4GPro.git
cd 4GPro
touch README.md
git add README.md
git commit -m "add README"
git push -u origin master
```

Existing folder
---------------
```
cd existing_folder
git init
git remote add origin http://liuteng@git.asiainfo.org/liuteng/4GPro.git
git add .
git commit
git push -u origin master
```

Existing Git repository
-----------------------
```
cd existing_repo
git remote add origin http://liuteng@git.asiainfo.org/liuteng/4GPro.git
git push -u origin --all
git push -u origin --tags
```