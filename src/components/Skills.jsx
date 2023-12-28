/* eslint-disable react/jsx-no-comment-textnodes */
import React from 'react';

import HTML from '../assets/html.png';
import CSS from '../assets/css.png';
import JavaScript from '../assets/javascript.png';
import Terraform from '../assets/terraform.png';
import Azure from '../assets/azure.png';
import GitHub from '../assets/github.png';
import Ansible from '../assets/ansible.png';
import Redhat from '../assets/redhat.png';
import Vmware from '../assets/vmware.png';
import Greenplum from '../assets/greenplum.png';
import Informatica from '../assets/informatica.png';
import Postgre from '../assets/postgre.png';

const Skills = () => {
  return (
    <div name='skills' className='w-full h-screen bg-[#081324] text-gray-300'>
      {/* Container */}
      <div className='max-w-[1000px] mx-auto p-4 flex flex-col justify-center w-full h-full'>
        <div>
            <p className='text-4xl font-bold inline border-b-4 border-purple-300 '>Skills</p>
            <p className='py-4'>// These are the technologies I've worked with</p>
        </div>

        <div className='w-full grid grid-cols-2 sm:grid-cols-4 gap-4 text-center py-8'>
            <div className='shadow-md shadow-[#040c16] hover:scale-110 duration-500'>
                <img className='w-20 mx-auto' src={GitHub} alt="HTML icon" />
                <p className='my-4'>GITHUB</p>
            </div>
            <div className='shadow-md shadow-[#040c16] hover:scale-110 duration-500'>
                <img className='w-16 mx-auto' src={Terraform} alt="HTML icon" />
                <p className='my-4'>TERRAFORM</p>
            </div>
            <div className='shadow-md shadow-[#040c16] hover:scale-110 duration-500'>
                <img className='w-16 mx-auto' src={Azure} alt="HTML icon" />
                <p className='my-4'>AZURE</p>  
            </div>
            <div className='shadow-md shadow-[#040c16] hover:scale-110 duration-500'>
                <img className='w-20 mx-auto' src={Redhat} alt="HTML icon" />
                <p className='my-4'>REDHAT</p>  
            </div>
            <div className='shadow-md shadow-[#040c16] hover:scale-110 duration-500'>
                <img className='w-20 mx-auto' src={Ansible} alt="HTML icon" />
                <p className='my-4'>ANSIBLE</p>  
            </div>
            <div className='shadow-md shadow-[#040c16] hover:scale-110 duration-500'>
                <img className='w-20 mx-auto' src={Vmware} alt="HTML icon" />
                <p className='my-4'>VMWARE</p>  
            </div>
            <div className='shadow-md shadow-[#040c16] hover:scale-110 duration-500'>
                <img className='w-20 mx-auto' src={Greenplum} alt="HTML icon" />
                <p className='my-4'>GREENPLUM DB</p>  
            </div>
            <div className='shadow-md shadow-[#040c16] hover:scale-110 duration-500'>
                <img className='w-20 mx-auto' src={Postgre} alt="HTML icon" />
                <p className='my-4'>POSTGRESQL DB</p>  
            </div>
            <div className='shadow-md shadow-[#040c16] hover:scale-110 duration-500'>
                <img className='w-20 mx-auto' src={Informatica} alt="HTML icon" />
                <p className='my-4'>INFORMATICA</p>  
            </div>
            <div className='shadow-md shadow-[#040c16] hover:scale-110 duration-500'>
                <img className='w-20 mx-auto' src={HTML} alt="HTML icon" />
                <p className='my-4'>HTML</p>
            </div>
            <div className='shadow-md shadow-[#040c16] hover:scale-110 duration-500'>
                <img className='w-20 mx-auto' src={CSS} alt="HTML icon" />
                <p className='my-4'>CSS</p>
            </div>
            <div className='shadow-md shadow-[#040c16] hover:scale-110 duration-500'>
                <img className='w-20 mx-auto' src={JavaScript} alt="HTML icon" />
                <p className='my-4'>JAVASCRIPT</p>
            </div>

            
        </div>
      </div>
    </div>
  );
};

export default Skills;
