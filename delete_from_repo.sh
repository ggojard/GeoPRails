git filter-branch --tag-name-filter cat --index-filter 'git rm -r --cached --ignore-unmatch node-v4.1.0-darwin-x64*' --prune-empty -f -- --all


#rm -rf .git/refs/original/
#git reflog expire --expire=now --all
#git gc --prune=now
#git gc --aggressive --prune=now
