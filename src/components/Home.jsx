import React from 'react';
import { HiArrowNarrowRight } from 'react-icons/hi';
import { Link } from 'react-scroll';

const Home = () => {
  return (
    <div name='home' className='w-full h-screen bg-[#081324]'>
      {/* Container */}
      <div className='max-w-[1000px] mx-auto px-8 flex flex-col justify-center h-full'>
        <p className='text-purple-300'>Hi, I'm</p>
        <h1 className='text-4xl sm:text-7xl font-bold text-[#ccd6f6]'>
          Jayllan
        </h1>
        <h2 className='text-4xl sm:text-7xl font-bold text-[#8892b0]'>
          I'm a Cloud Engineer.
        </h2>
        <p className='text-[#8892b0] py-4 max-w-[700px]'>
          I’m a Cloud/DevOps Engineer and a Freelancer providing services for Cloud, DevOps, & Infrastructure needs.
        </p>
        <div>
        <Link to='skills' smooth={true} duration={500}>
            <button className='text-white group border-2 px-6 py-3 my-2 flex items-center hover:bg-purple-300 hover:border-purple-300'>
            View Skills
            <span className='group-hover:rotate-90 duration-300'>
              <HiArrowNarrowRight className='ml-3 ' />
            </span>
          </button>
          </Link>
          
        </div>
      </div>
    </div>
  );
};

export default Home;
