TAG_PATTERN="peerlab@1.0.0"

git ls-remote --tags origin | grep "refs/tags/$TAG_PATTERN" | grep -v "\^{}" | awk -F/ '{print $NF}' | xargs -I {} git push origin --delete {} &&
git tag -l "$TAG_PATTERN*" | xargs -I {} git tag -d {}