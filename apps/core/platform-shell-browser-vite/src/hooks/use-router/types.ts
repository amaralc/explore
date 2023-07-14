export type NavigateOptions = object;

export interface IRouter {
  /**
   * Navigate to the previous history entry.
   */
  back(): void;

  /**
   * Navigate to the next history entry.
   */
  forward(): void;

  /**
   * Refresh the current page.
   */
  refresh(): void;

  /**
   * Navigate to the provided href.
   * Pushes a new history entry.
   */
  push(href: string, options?: NavigateOptions): void;

  /**
   * Navigate to the provided href.
   * Replaces the current history entry.
   */
  replace(href: string, options?: NavigateOptions): void;

  /**
   * Prefetch the provided href.
   */
  prefetch(href: string): void;
}
