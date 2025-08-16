// Release metadata only - actual content is loaded from /releases/*.md files
export const releaseMetadata = [
  {
    version: 'v3.0.0',
    date: '2025-08-01',
    title: 'Internationalization, Task History, Sub-agents, Lightbox',
    summary: 'Multi-language support, template customization, project history, agent management, image lightbox, and major UI enhancements'
  },
  {
    version: 'v2.1.0',
    date: '2025-07-29',
    title: 'Enhanced Task Management & VS Code Integration',
    summary: 'VS Code file links, improved UUID management, dependencies column, and in-app release notes'
  },
  {
    version: 'v2.0.0',
    date: '2025-07-27',
    title: 'Initial Standalone Release',
    summary: 'Web-based task viewer with profile management, real-time updates, and modern UI'
  }
];

export const getLatestVersion = () => releaseMetadata[0];

export const getReleaseFile = (version) => {
  return `/releases/${version}.md`;
};