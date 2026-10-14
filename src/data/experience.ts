import type { ArchiveProject } from './projects';
export function experienceTypes(project: Pick<ArchiveProject,'experiences'|'media'>): ('watch'|'listen'|'look')[] {
  if (project.experiences?.length) return project.experiences;
  return project.media?.some(item=>item.kind==='audio') ? ['listen'] : project.media?.some(item=>item.kind==='video') ? ['watch'] : ['look'];
}
export const experienceType = (project: Pick<ArchiveProject,'experiences'|'media'>) => experienceTypes(project).join(' + ');
export const formatDuration = (seconds: number) => {
  const rounded = Math.round(seconds);
  return Math.floor(rounded/60)+':'+String(rounded%60).padStart(2,'0');
};
