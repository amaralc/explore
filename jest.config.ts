import { getJestProjectsAsync } from '@nx/jest';

export default async function getJestConfig() {
  return {
    projects: await getJestProjectsAsync(),
  };
}