import {
  SiAmazonaws,
  SiAnsible,
  SiDebian,
  SiGithub,
  SiGooglecloud,
  SiInformatica,
  SiJavascript,
  SiKubernetes,
  SiMicrosoftazure,
  SiPhp,
  SiPostgresql,
  SiPython,
  SiRedhat,
  SiTerraform,
  SiVmware,
} from 'react-icons/si';
import { FiCloud, FiCode, FiServer, FiDatabase } from 'react-icons/fi';
import Greenplum from '../assets/greenplum.png';

// All site copy and links live here, so updating the portfolio
// doesn't require touching the components.
export const profile = {
  firstName: 'Jayllan',
  name: 'Jayllan Abecia',
  role: 'Cloud & DevOps Engineer',
  tagline:
    "I'm a Cloud/DevOps Engineer and a Freelancer providing services for Cloud, DevOps, & Infrastructure needs.",
  email: 'abeciaj23@gmail.com',
  resume:
    'https://docs.google.com/document/d/1Rv2qdPQiPw4rISZtrC-LXS4RRLoooJ6l5viO5oJaPhM/edit?usp=sharing',
  linkedin: 'https://www.linkedin.com/in/jayllan-abecia-907b3119a/',
  github: 'https://github.com/abeciaj',
  formEndpoint: 'https://getform.io/f/d172da75-cfe4-4bd5-9da4-751c3a13921c',
  about: [
    'I am a passionate cloud engineer with a keen interest in staying at the forefront of technology trends. I thrive on exploring new technologies and discovering innovative solutions to challenges in the ever-evolving tech landscape.',
    "When I'm not immersed in the world of cloud computing, you'll often find me engrossed in a good book. Let's navigate the digital realm together!",
  ],
};

export const services = [
  {
    icon: FiCloud,
    title: 'Cloud Infrastructure',
    text: 'Designing, deploying and running workloads across AWS, Azure and Google Cloud.',
  },
  {
    icon: FiCode,
    title: 'Infrastructure as Code',
    text: 'Repeatable environments and automation with Terraform, Ansible and CI/CD pipelines.',
  },
  {
    icon: FiServer,
    title: 'Platforms & Linux',
    text: 'Kubernetes, Red Hat and Debian systems, and VMware virtualization.',
  },
  {
    icon: FiDatabase,
    title: 'Data Platforms',
    text: 'PostgreSQL and Greenplum databases and Informatica data integration.',
  },
];

// `icon` is a react-icons component; `image` is used for logos
// that react-icons doesn't provide. `wide` is for wordmark-style logos.
// Icons without a `color` use the theme's text color (for black/white logos).
export const skillGroups = [
  {
    title: 'Cloud',
    skills: [
      { name: 'AWS', icon: SiAmazonaws, color: '#FF9900' },
      { name: 'Azure', icon: SiMicrosoftazure, color: '#0089D6' },
      { name: 'Google Cloud', icon: SiGooglecloud, color: '#4285F4' },
    ],
  },
  {
    title: 'DevOps & IaC',
    skills: [
      { name: 'Kubernetes', icon: SiKubernetes, color: '#326CE5' },
      { name: 'Terraform', icon: SiTerraform, color: '#844FBA' },
      { name: 'Ansible', icon: SiAnsible, color: '#EE0000' },
      { name: 'GitHub', icon: SiGithub },
    ],
  },
  {
    title: 'Systems & Virtualization',
    skills: [
      { name: 'Red Hat', icon: SiRedhat, color: '#EE0000' },
      { name: 'Debian', icon: SiDebian, color: '#D70A53' },
      { name: 'VMware', icon: SiVmware, wide: true },
    ],
  },
  {
    title: 'Data',
    skills: [
      { name: 'PostgreSQL', icon: SiPostgresql, color: '#6A9FD4' },
      { name: 'Greenplum', image: Greenplum },
      { name: 'Informatica', icon: SiInformatica, color: '#FF4D00' },
    ],
  },
  {
    title: 'Web',
    skills: [
      { name: 'PHP', icon: SiPhp, color: '#777BB4' },
      { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
      { name: 'Python', icon: SiPython, color: '#3776AB' },
    ],
  },
];
