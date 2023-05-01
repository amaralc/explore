import { GetStaticProps } from 'next';

export const getStaticProps: GetStaticProps = () => {
  return {
    props: {
      title: 'Knowledge Network',
    },
  };
};

const KnowledgeNetworkPage = (props: { title: string }) => {
  return <h1>{props.title}</h1>;
};

export default KnowledgeNetworkPage;
