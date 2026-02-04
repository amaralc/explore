import DefaultChangelogRenderer from 'nx/release/changelog-renderer';
import { execSync } from 'child_process';

const TAG_PREFIX = 'peerlab@';

export default class ChangelogRenderer extends DefaultChangelogRenderer {
  protected override renderVersionTitle(): string {
    const version = this.changelogEntryVersion.replace(/^v/, '');
    const isMajorVersion = /^\d+\.0\.0$/.test(version);
    const headingLevel = isMajorVersion ? '#' : '##';

    let dateStr = '';
    if (this.changelogRenderOptions.versionTitleDate) {
      dateStr = ` (${new Date().toISOString().slice(0, 10)})`;
    }

    const remoteRepoData = this.remoteReleaseClient?.getRemoteRepoData();
    if (remoteRepoData) {
      const previousVersion = this.findPreviousVersion();
      if (previousVersion) {
        const currentTag = `${TAG_PREFIX}${this.changelogEntryVersion}`;
        const previousTag = `${TAG_PREFIX}${previousVersion}`;
        const compareUrl = `https://${remoteRepoData.hostname}/${remoteRepoData.slug}/compare/${previousTag}...${currentTag}`;
        return `${headingLevel} [${this.changelogEntryVersion}](${compareUrl})${dateStr}`;
      }
    }

    return `${headingLevel} ${this.changelogEntryVersion}${dateStr}`;
  }

  private findPreviousVersion(): string | null {
    try {
      const result = execSync(
        `git tag --list "${TAG_PREFIX}*" --sort=-v:refname`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      const tags = result.trim().split('\n').filter(Boolean);
      const currentTag = `${TAG_PREFIX}${this.changelogEntryVersion}`;
      const currentIndex = tags.indexOf(currentTag);

      // Current tag exists (re-run): return the next one (previous version)
      if (currentIndex >= 0 && currentIndex < tags.length - 1) {
        return tags[currentIndex + 1].replace(TAG_PREFIX, '');
      }

      // Current tag doesn't exist yet (typical during release): latest tag is previous
      if (currentIndex === -1 && tags.length > 0) {
        return tags[0].replace(TAG_PREFIX, '');
      }

      return null;
    } catch {
      return null;
    }
  }
}
