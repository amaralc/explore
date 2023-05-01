import { ISubjectsTagList } from './types';

export const SubjectsTagsList: ISubjectsTagList = ({ subjects }) => {
  return (
    <div>
      {subjects.map((subject) => (
        <a key={subject} href={`/subjects/${subject}`} target="_blank" rel="noopener noreferrer">
          {subject}
        </a>
      ))}
    </div>
  );
};
