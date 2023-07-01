export const mainDescriptionMarkdown = `
An API to find peers for your research project

## Stability levels explained

We found that it's important to communicate the stability of our APIs to our users. This is especially true for our pre-stable APIs,
which are still evolving and may change in a backward-incompatible way. Since Kotlin docs have a mature and well described
stability level system, we decided to adopt it as is.

Source: [(“Stability of Kotlin components | Kotlin,” 2023)](https://kotlinlang.org/docs/components-stability.html#github-badges-for-kotlin-components)

Here's a quick guide to these stability levels and their meaning:

- \`Experimental\` means "try it only in toy projects":

  - We are just trying out an idea and want some users to play with it and give feedback. If it doesn't work out, we may drop it any minute.

- \`Alpha\` means "use at your own risk, expect migration issues":

  - We decided to productize this idea, but it hasn't reached the final shape yet.

- \`Beta\` means "you can use it, we'll do our best to minimize migration issues for you":
  - It's almost done, user feedback is especially important now.
  - Still, it's not 100% finished, so changes are possible (including ones based on your own feedback).
  - Watch for deprecation warnings in advance for the best update experience.

We collectively refer to Experimental, Alpha, and Beta as pre-stable levels.

- \`Stable\` means "use it even in most conservative scenarios":

  - It's done. We will be evolving it according to our strict backward compatibility rules.

Please note that stability levels do not say anything about how soon a component will be released as Stable. Similarly, they do not indicate how much a component will be changed before release. They only say how fast a component is changing and how much risk of update issues users are running.

## References

**Stability of Kotlin components | Kotlin**. (2023). Kotlin Help. Retrieved from https://kotlinlang.org/docs/components-stability.html
`;
