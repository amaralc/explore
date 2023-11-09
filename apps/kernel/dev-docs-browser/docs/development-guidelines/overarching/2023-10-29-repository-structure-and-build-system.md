---
title: 2023-10-29 Repository Structure and Build System
---

## Background

We have tried different ways of organizing back-end, front-end and infrastructure code. Moving each part to a different repository brought isolation, which is great for access management and security, but comes with the overhead of checking in and out and switching context to review pull requests, which is horrible for productivity and consistency (the same isolation that comes with security, reduce knowledge sharing).

At the same time, bringing all the code to the same repository without minimum structure and tooling can also be overwhelming and reduce productivity. In no time, the codebase can become a mess if no rules are set.

## Decision

We have decided to use an integrated monorepo managed with [Nx Build System](https://nx.dev/). With that setup, all dependencies are centrally managed in a single `package.json` file and all libraries, apps and packages use the same version of each dependency as recommended by Winters et al. [(Winters et al., 2020)](https://www.amazon.com/Software-Engineering-Google-Lessons-Programming/dp/1492082791).

The repository structure was developed around the idea of teams and services managed by each team, which each service having its own `iac` module that is called from a root `iac` module (which is one of the services).

```
apps
 ├── team-01
 │   ├── svc-01
 │   └── svc-02
 │
 └── team-02
     ├── svc-03
     └── svc-04
```

With a single source of truth repository, we take advantage of nx tooling (local and remote caches, nx-affected, graphs),
saving in build times, sharing knowledge, adding simplicity and consistency over the entire codebase [(Winters et al., 2020)](https://www.amazon.com/Software-Engineering-Google-Lessons-Programming/dp/1492082791) [(Kim et al., 2021)](https://www.amazon.com.br/Manual-DevOps-confiabilidade-organiza%C3%A7%C3%B5es-tecnol%C3%B3gicas/dp/8550802697/ref=asc_df_8550802697/?tag=googleshopp00-20&linkCode=df0&hvadid=379715964603&hvpos=&hvnetw=g&hvrand=6470578623008363323&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9101256&hvtargid=pla-809606891693&psc=1).

## References

- Winters, T., Manshreck, T. and Wright, H. (2020). Software Engineering at Google: Lessons Learned from Programming over Time.
- Kim, G., Humble, J., Debois, P., Willis, J. and Forsgren, N. (2021). The DevOps Handbook, IT Revolution.
