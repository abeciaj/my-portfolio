import {
  SiAmazonaws,
  SiAnsible,
  SiDebian,
  SiDocker,
  SiGit,
  SiGithubactions,
  SiGooglecloud,
  SiGrafana,
  SiHelm,
  SiInformatica,
  SiJenkins,
  SiKubernetes,
  SiMicrosoft,
  SiMicrosoftazure,
  SiMicrosoftsqlserver,
  SiMysql,
  SiPostgresql,
  SiPrometheus,
  SiRedhat,
  SiTerraform,
  SiVmware,
  SiWindows,
} from 'react-icons/si';
import { FiCloud, FiCode, FiServer, FiDatabase } from 'react-icons/fi';
import Greenplum from '../assets/greenplum.png';
import { SiTrivy, SiUptimeKuma } from './brandIcons';

// All site copy and links live here, so updating the portfolio
// doesn't require touching the components.
export const profile = {
  firstName: 'Jayllan',
  name: 'Jayllan Abecia',
  role: 'Cloud & DevOps Engineer',
  tagline:
    "I'm a Cloud/DevOps Engineer and a Freelancer providing services for Cloud, DevOps, & Infrastructure needs.",
  location: 'Melbourne, Australia',
  email: 'jabecia23@gmail.com',
  // public/resume.pdf, opened in the browser's PDF viewer
  resume: '/resume.pdf',
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
// `monogram` shows a letter badge in `color` for tools with no available logo.
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
      { name: 'Docker', icon: SiDocker, color: '#2496ED' },
      { name: 'Helm', icon: SiHelm },
      { name: 'Terraform', icon: SiTerraform, color: '#844FBA' },
      { name: 'Ansible', icon: SiAnsible, color: '#EE0000' },
      { name: 'Git', icon: SiGit, color: '#F05032' },
      { name: 'GitHub Actions', icon: SiGithubactions, color: '#2088FF' },
      { name: 'Jenkins', icon: SiJenkins, color: '#D24939' },
    ],
  },
  {
    title: 'Monitoring & Logging',
    skills: [
      { name: 'Prometheus', icon: SiPrometheus, color: '#E6522C' },
      { name: 'Grafana', icon: SiGrafana, color: '#F46800' },
      { name: 'Zabbix', monogram: 'Z', color: '#D40000' },
      { name: 'Uptime Kuma', icon: SiUptimeKuma, color: '#5CDD8B' },
    ],
  },
  {
    title: 'Security & Vulnerability Assessment',
    skills: [
      { name: 'Mend', monogram: 'M', color: '#6D28D9' },
      { name: 'Trivy', icon: SiTrivy },
      { name: 'Kubescape', monogram: 'K', color: '#326CE5' },
      { name: 'Fail2ban', monogram: 'F2B', color: '#B91C1C' },
    ],
  },
  {
    title: 'Systems & Virtualization',
    skills: [
      { name: 'Red Hat', icon: SiRedhat, color: '#EE0000' },
      { name: 'Debian', icon: SiDebian, color: '#D70A53' },
      { name: 'Windows Server', icon: SiWindows, color: '#0078D6' },
      { name: 'VMware', icon: SiVmware, wide: true },
    ],
  },
  {
    title: 'Data',
    skills: [
      { name: 'PostgreSQL', icon: SiPostgresql, color: '#6A9FD4' },
      { name: 'MySQL', icon: SiMysql, color: '#4479A1', wide: true },
      { name: 'SQL Server', icon: SiMicrosoftsqlserver, color: '#CC2927' },
      { name: 'Greenplum', image: Greenplum },
      { name: 'Informatica', icon: SiInformatica, color: '#FF4D00' },
    ],
  },
];

// Newest first. `highlights` are achievements from the resume.
export const experience = [
  {
    role: 'Database, Application & DDoS Administrator',
    company: 'Bitxify Pty. Ltd.',
    start: 'Jul 2024',
    end: 'Present',
    summary:
      'Managing cloud-based systems and services across AWS and Microsoft Azure, and administering MySQL and PostgreSQL environments.',
    highlights: [
      'Developed IIS and Windows Services deployment scripts, reducing application deployment time by 80%.',
      'Implemented Prometheus and Grafana monitoring for better visibility into system and application performance.',
      'Automated initial configuration and dependency installation for new Windows Servers.',
      'Led the implementation of Azure and AWS Savings Plans to optimize compute costs.',
    ],
    tags: ['AWS', 'Azure', 'MySQL', 'PostgreSQL', 'Windows Server', 'Prometheus', 'Grafana'],
  },
  {
    role: 'Cloud Engineer',
    company: 'QBE Insurance',
    start: 'Oct 2022',
    end: 'Dec 2023',
    summary:
      'Developed and maintained Infrastructure as Code with Terraform, and built CI/CD pipelines for infrastructure and application deployments.',
    highlights: [
      'Developed reusable Terraform modules for Azure Web Apps and Container Apps, improving deployment consistency.',
      'Built an automated Azure subscription quota management script, reducing manual administration.',
      'Identified opportunities to improve cloud resource utilization, performance and cost efficiency.',
    ],
    tags: ['Azure', 'Terraform', 'CI/CD'],
  },
  {
    role: 'DevOps Sysadmin',
    company: 'Innovuze Solutions Inc.',
    start: 'May 2020',
    end: 'Feb 2022',
    summary:
      'Managed cloud infrastructure, servers and CI/CD pipelines, and designed infrastructure with Terraform.',
    highlights: [
      'Introduced reusable Terraform modules, standardizing infrastructure provisioning.',
      'Implemented SAST and vulnerability scanning with Mend and Trivy in CI/CD pipelines.',
      'Implemented server hardening and security controls to reduce vulnerability exposure.',
      'Led the implementation of Azure Savings Plans to optimize compute costs.',
    ],
    tags: ['Terraform', 'Azure', 'CI/CD', 'Mend', 'Trivy'],
  },
];

// `years` is omitted where it isn't confirmed.
export const education = [
  { degree: 'Master of Information Technology', school: 'Torrens University Australia', years: '2024 – 2025' },
  { degree: 'Bachelor of Science in Information Technology', school: 'University of Southern Philippines' },
];

const microsoft = { icon: SiMicrosoft, color: '#00A4EF', issuer: 'Microsoft' };
const google = { icon: SiGooglecloud, color: '#4285F4', issuer: 'Google Cloud' };

// Newest first. Add `url` (e.g. a Credly or Microsoft Learn link) to make a card clickable.
export const certifications = [
  { name: 'DevOps Engineer Expert', code: 'AZ-400', date: 'Jan 2026', ...microsoft },
  { name: 'Azure Solutions Architect Expert', code: 'AZ-305', date: 'Dec 2025', ...microsoft },
  { name: 'Terraform Associate', code: '003', date: 'Jan 2025', icon: SiTerraform, color: '#844FBA', issuer: 'HashiCorp' },
  { name: 'Azure Administrator Associate', code: 'AZ-104', date: 'Dec 2024', ...microsoft },
  { name: 'Professional Cloud Architect', code: 'PCA', date: 'Oct 2024', ...google },
  { name: 'Associate Cloud Engineer', code: 'ACE', date: 'Sep 2024', ...google },
  { name: 'Security, Compliance, and Identity Fundamentals', code: 'SC-900', date: 'Feb 2023', ...microsoft },
  { name: 'Azure Data Fundamentals', code: 'DP-900', date: 'Sep 2021', ...microsoft },
];
