import React, { useState } from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { FiMail, FiSend } from 'react-icons/fi';
import { profile } from '../data/profile';

const Contact = () => {
  // idle | sending | sent | error
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus('sending');
    try {
      const res = await fetch(profile.formEndpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`Form submit failed: ${res.status}`);
      form.reset();
      setStatus('sent');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <section id='contact' className='section'>
      <p className='section-label'>03. Contact</p>
      <h2 className='section-title'>Let's build something together</h2>

      <div className='mt-12 grid gap-12 md:grid-cols-5'>
        <div className='space-y-6 md:col-span-2'>
          <p className='text-lg leading-relaxed text-ink-muted'>
            Need help with cloud, DevOps or infrastructure? Send me a message using the form, or reach
            out directly. I'll get back to you as soon as I can.
          </p>
          <ul className='space-y-4'>
            <li>
              <a href={`mailto:${profile.email}`} className='flex items-center gap-3 text-ink transition-colors hover:text-accent'>
                <FiMail className='text-xl text-accent' aria-hidden='true' />
                <span className='break-all'>{profile.email}</span>
              </a>
            </li>
            <li>
              <a href={profile.linkedin} target='_blank' rel='noreferrer' className='flex items-center gap-3 text-ink transition-colors hover:text-accent'>
                <FaLinkedin className='text-xl text-accent' aria-hidden='true' />
                LinkedIn
              </a>
            </li>
            <li>
              <a href={profile.github} target='_blank' rel='noreferrer' className='flex items-center gap-3 text-ink transition-colors hover:text-accent'>
                <FaGithub className='text-xl text-accent' aria-hidden='true' />
                GitHub
              </a>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className='card space-y-5 p-6 sm:p-8 md:col-span-3'>
          <div>
            <label htmlFor='name' className='mb-2 block text-sm font-medium text-ink'>Name</label>
            <input id='name' name='name' type='text' required autoComplete='name' className='field' />
          </div>
          <div>
            <label htmlFor='email' className='mb-2 block text-sm font-medium text-ink'>Email</label>
            <input id='email' name='email' type='email' required autoComplete='email' className='field' />
          </div>
          <div>
            <label htmlFor='message' className='mb-2 block text-sm font-medium text-ink'>Message</label>
            <textarea id='message' name='message' rows='6' required className='field resize-y' />
          </div>
          {/* Honeypot: Getform discards submissions that fill this in */}
          <input type='hidden' name='_gotcha' />

          <button type='submit' disabled={status === 'sending'} className='btn-primary w-full justify-center disabled:opacity-60'>
            {status === 'sending' ? 'Sending…' : 'Send message'}
            <FiSend aria-hidden='true' />
          </button>

          <p role='status' className='min-h-[1.5rem] text-sm'>
            {status === 'sent' && <span className='text-success'>Thanks! Your message has been sent.</span>}
            {status === 'error' && (
              <span className='text-danger'>
                Something went wrong. Please email me at{' '}
                <a href={`mailto:${profile.email}`} className='underline'>{profile.email}</a>.
              </span>
            )}
          </p>
        </form>
      </div>
    </section>
  );
};

export default Contact;
