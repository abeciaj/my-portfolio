import React from 'react';

const About = () => {
  return (
    <div name='about' className='w-full h-screen bg-[#081324] text-gray-300'>
      <div className='flex flex-col justify-center items-center w-full h-full'>
        <div className='max-w-[1000px] w-full grid grid-cols-2 gap-8'>
          <div className='sm:text-right pb-8 pl-4'>
            <p className='text-4xl font-bold inline border-b-4 border-purple-300'>
              About
            </p>
          </div>
          <div></div>
          </div>
          <div className='max-w-[1000px] w-full grid sm:grid-cols-2 gap-8 px-4'>
            <div className='sm:text-right text-4xl font-bold'>
              <p>Hello I'm Jayllan Abecia, nice to meet you!</p>
            </div>
            <div>
              <p>I am a passionate cloud engineer with a keen interest in staying
               at the forefront of technology trends. When I'm not immersed in 
               the world of cloud computing, you'll often find me engrossed in 
               a good book. I thrive on exploring new technologies and discovering 
               innovative solutions to challenges in the ever-evolving tech 
               landscape. Let's navigate the digital realm together! 
               🚀📚 #CloudEngineer #TechEnthusiast</p>  
            </div>
          </div>
      </div>
    </div>
  );
};

export default About;
