import React, { useState } from 'react';
import { FiGithub, FiLinkedin, FiMail, FiMapPin, FiSend } from 'react-icons/fi';
import { profile } from '../data/profile';
import Reveal from './Reveal';

const channels = [
  { icon: FiMail, label: profile.email, href: `mailto:${profile.email}` },
  { icon: FiLinkedin, label: 'LinkedIn', href: profile.linkedin, external: true },
  { icon: FiGithub, label: 'GitHub', href: profile.github, external: true },
  { icon: FiMapPin, label: profile.location },
];

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
    <section id='contact' className='band relative isolate overflow-hidden'>
      <div aria-hidden='true' className='glow absolute -right-32 -bottom-32 -z-10 h-[36rem] w-[36rem]' />
      <div aria-hidden='true' className='bg-dots fade-edges absolute inset-0 -z-20 opacity-60' />
      <div className='section'>
        <Reveal>
          <h2 className='section-title max-w-3xl'>Let's build something together</h2>
          <p className='lead mt-6'>
            Need help with cloud, DevOps or infrastructure? Send a message below or email me directly.
          </p>
        </Reveal>

        <div className='mt-14 grid gap-12 lg:grid-cols-12'>
          <Reveal as='ul' className='space-y-5 lg:col-span-4'>
            {channels.map(({ icon: Icon, label, href, external }) => {
              const content = (
                <>
                  <Icon className='h-5 w-5 shrink-0 text-accent' aria-hidden='true' />
                  <span className='min-w-0 break-words'>{label}</span>
                </>
              );
              return (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                      className='flex items-center gap-3 text-ink transition-colors duration-200 hover:text-accent'
                    >
                      {content}
                    </a>
                  ) : (
                    <p className='flex items-center gap-3 text-ink-muted'>{content}</p>
                  )}
                </li>
              );
            })}
          </Reveal>

          <Reveal as='form' delay={120} onSubmit={handleSubmit} className='tile grid gap-5 p-6 sm:grid-cols-2 sm:p-8 lg:col-span-8'>
            <div className='grid gap-2'>
              <label htmlFor='name' className='text-sm font-medium text-ink'>Name</label>
              <input id='name' name='name' type='text' required autoComplete='name' className='field' />
            </div>
            <div className='grid gap-2'>
              <label htmlFor='email' className='text-sm font-medium text-ink'>Email</label>
              <input id='email' name='email' type='email' required autoComplete='email' spellCheck={false} className='field' />
            </div>
            <div className='grid gap-2 sm:col-span-2'>
              <label htmlFor='message' className='text-sm font-medium text-ink'>Message</label>
              <textarea id='message' name='message' rows='6' required className='field resize-y' />
            </div>
            {/* Honeypot: Getform discards submissions that fill this in */}
            <input type='hidden' name='_gotcha' />

            <div className='flex flex-wrap items-center gap-4 sm:col-span-2'>
              <button type='submit' disabled={status === 'sending'} className='btn-primary disabled:opacity-60'>
                {status === 'sending' ? 'Sending…' : 'Send message'}
                <FiSend aria-hidden='true' />
              </button>
              <p role='status' className='text-sm'>
                {status === 'sent' && <span className='text-success'>Thanks! Your message has been sent.</span>}
                {status === 'error' && (
                  <span className='text-danger'>
                    Something went wrong. Please email me at{' '}
                    <a href={`mailto:${profile.email}`} className='underline'>{profile.email}</a>.
                  </span>
                )}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Contact;
