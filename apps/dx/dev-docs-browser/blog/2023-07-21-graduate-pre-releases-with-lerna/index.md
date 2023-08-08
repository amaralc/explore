---
title: 'Graduate Pre-release tags with Lerna'
authors: [amaralc]
tags: [devops, compass, deployment-frequency, dora, dora-metrics]
description: 'Graduate Pre-release to production tags with Lerna'
---

To make Lerna create a production tag after a prerelease, you can use the --conventional-graduate flag. This flag will cause Lerna to remove the pre-release information from previously created pre-release tags, and then create a production tag with that version number.

For example, if you run the following command:

```bash
lerna version prerelease --preid beta
```

The tag `my-app@0.37.4-beta.0` will be created and pushed to your repository.

After that, if you run the following command:

```bash
lerna version --conventional-graduate
```

Lerna will create the `my-app@0.37.4` tag. Note that it has the same version number as the `my-app@0.37.4-beta.0` tag, but without the pre-release information.

You can also use the --dist-tag flag to specify the name of the production tag. For example, the following command will create a production tag called production:

```bash
lerna version prerelease --preid beta
lerna version --conventional-graduate --dist-tag production
```

This will create the following tags:

```bash
my-app@0.37.4-beta.0
my-app@0.37.4
my-app@0.37.4#production
```

The `my-app@0.37.4#production` tag is the production tag.

## References

- Canchal, X. (2021, September 23). Monorepo using Lerna, Conventional commits, and Github packages, DEV Community. Retrieved July 21, 2023, from https://dev.to/xcanchal/monorepo-using-lerna-conventional-commits-and-github-packages-4m8m
- lerna. (2018, November 9). What is the correct workflow to promote pre-release · Issue #1774 · lerna/lerna, GitHub. Retrieved from https://github.com/lerna/lerna/issues/1774
- UNPKG - @lerna/version. (n.d.). UNPKG - @lerna/Version. Retrieved from https://unpkg.com/browse/@lerna/version@6.6.2/README.md
- Try Bard, an AI experiment by Google. (n.d.). Try Bard, an AI Experiment by Google. Retrieved from https://bard.google.com
- Khandelwal, S. (2021). Lerna from a DevOps point of view, Lerna from a DevOps Point of View. Retrieved August 7, 2023, from https://www.linkedin.com/pulse/lerna-from-devops-point-view-shishir-khandelwal
