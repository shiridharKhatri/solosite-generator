'use client';

import React from 'react';
import { EditableText } from '../editor/EditableText';
import { EditableImage } from '../editor/EditableImage';
import { EditableButton } from '../editor/EditableButton';
import { useStore } from '@/lib/store';

export const HiralamuTemplate: React.FC = () => {
  const { projectData, updateHero, updateFeature, updatePricing } = useStore();

  if (!projectData) return null;

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-12 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none">H</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Hiralamu</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-green-500 transition-colors">Home</a>
          <a href="#" className="hover:text-green-500 transition-colors">Features</a>
          <a href="#" className="hover:text-green-500 transition-colors">Pricing</a>
          <a href="#" className="hover:text-green-500 transition-colors">Blog</a>
          <a href="#" className="hover:text-green-500 transition-colors">Testimonials</a>
        </div>
        <button className="bg-black text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
          LOG IN
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 text-center overflow-hidden">
        {/* Background Grid/Effect */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        
        <div className="max-w-4xl mx-auto">
          <EditableText
            tagName="h1"
            value={projectData.hero.title}
            onChange={(val) => updateHero({ title: val })}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-gray-900 mb-6"
          />
          <EditableText
            tagName="p"
            value={projectData.hero.subtitle}
            onChange={(val) => updateHero({ subtitle: val })}
            className="text-lg text-gray-500 mb-10 max-w-xl mx-auto"
          />
          <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
            <EditableButton
              value={projectData.hero.buttonText}
              onChange={(val) => updateHero({ buttonText: val })}
              className="bg-green-500 text-black hover:bg-green-400"
            />
            <button className="flex items-center gap-2 px-6 py-2 rounded-full font-semibold border border-gray-200 hover:bg-gray-50 transition-all">
              <span className="w-5 h-5 flex items-center justify-center bg-black text-white rounded-full">
                <svg className="w-3 h-3 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </span>
              Watch Demo
            </button>
          </div>
        </div>

        {/* Floating Avatars (Representational) */}
        <div className="relative max-w-5xl mx-auto h-64 md:h-96">
          <div className="absolute top-0 left-10 md:left-20 animate-bounce delay-100">
            <div className="bg-white p-2 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100">
              <img src="https://i.pravatar.cc/40?u=1" className="w-10 h-10 rounded-full" alt="" />
              <div className="text-left">
                <p className="text-xs font-bold">Mila Grogone</p>
                <div className="flex gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-10 right-10 md:right-20 animate-bounce delay-300">
             <div className="bg-white p-2 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100">
              <img src="https://i.pravatar.cc/40?u=2" className="w-10 h-10 rounded-full" alt="" />
               <div className="text-left">
                <p className="text-xs font-bold">Alaxa Alandres</p>
                <div className="flex gap-1 mt-1">
                   <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                   <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                </div>
              </div>
            </div>
          </div>
          {/* Main Hero Card */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-60 bg-teal-800 rounded-3xl shadow-2xl overflow-hidden border-4 border-white rotate-6">
             <div className="p-4 text-left">
                <div className="w-full h-24 bg-teal-700/50 rounded-xl mb-4"></div>
                <div className="w-3/4 h-3 bg-white/20 rounded-full mb-2"></div>
                <div className="w-1/2 h-3 bg-white/10 rounded-full"></div>
             </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-12 border-y border-gray-100 mb-20 overflow-hidden">
        <div className="flex justify-center flex-wrap gap-12 opacity-40 grayscale items-center px-6">
          <img src="https://cdn.worldvectorlogo.com/logos/miro-2.svg" className="h-6" alt="Miro" />
          <img src="https://cdn.worldvectorlogo.com/logos/stripe-2.svg" className="h-6" alt="Stripe" />
          <img src="https://cdn.worldvectorlogo.com/logos/google-2015.svg" className="h-6" alt="Google" />
          <img src="https://cdn.worldvectorlogo.com/logos/adobe-2.svg" className="h-6" alt="Adobe" />
          <img src="https://cdn.worldvectorlogo.com/logos/spotify-2.svg" className="h-6" alt="Spotify" />
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-12 max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        <div>
          <span className="text-green-600 font-bold text-sm tracking-widest uppercase mb-4 block italic">About Our Platform</span>
          <EditableText
            tagName="h2"
            value={projectData.about.title}
            onChange={(val) => {}} // Handle state update
            className="text-4xl font-bold leading-tight mb-6"
          />
          <EditableText
            tagName="p"
            value={projectData.about.description}
            onChange={(val) => {}}
            className="text-gray-500 mb-8"
          />
          <EditableButton
            value="About Us"
            onChange={() => {}}
            className="bg-green-500 text-black px-8"
          />
        </div>
        <div className="grid grid-cols-1 gap-6">
           <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-4 right-4 text-gray-200">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>
              </div>
              <h3 className="text-4xl font-bold mb-2">120k <span className="text-green-500">Users</span></h3>
              <p className="text-sm text-gray-500">Accelerate hiring and expand globally with tools designed for every stage of growth.</p>
           </div>
            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 relative overflow-hidden group">
               <div className="absolute top-4 right-4 text-gray-200">
                 <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>
               </div>
               <h3 className="text-4xl font-bold mb-2">120+ <span className="text-green-500">Companies</span></h3>
               <p className="text-sm text-gray-500">Accelerate hiring and expand globally with tools designed for every stage of growth.</p>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 px-6 rounded-[4rem] mx-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <span className="text-green-600 font-bold text-sm tracking-widest uppercase mb-4 block italic">Our Features</span>
          <EditableText
            tagName="h2"
            value="Streamline Your Hiring Workflow From Start To Finish"
            onChange={() => {}}
            className="text-4xl font-bold"
          />
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
           {projectData.features?.map((feature, i) => (
             <div key={i} className={`p-8 rounded-[2.5rem] border border-zinc-100 flex flex-col gap-6 ${i === 0 ? 'bg-teal-800 text-white' : 'bg-white'}`}>
                <div className="h-48 overflow-hidden rounded-2xl bg-teal-700/20 relative p-4 flex items-center justify-center">
                   <EditableImage src={feature.image || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=400'} onChange={(val) => updateFeature(i, { image: val })} className="w-full h-full rounded-xl" />
                </div>
                <div>
                   <EditableText
                     tagName="h4"
                     value={feature.title}
                     onChange={(val) => updateFeature(i, { title: val })}
                     className="text-xl font-bold mb-3"
                   />
                   <EditableText
                     tagName="p"
                     value={feature.description}
                     onChange={(val) => updateFeature(i, { description: val })}
                     className={`text-sm ${i === 0 ? 'text-teal-100' : 'text-gray-500'}`}
                   />
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-32 px-6 text-center">
         <span className="text-green-600 font-bold text-sm tracking-widest uppercase mb-4 block italic">Connect With The Tools</span>
         <div className="max-w-2xl mx-auto mb-20 relative">
            <h2 className="text-4xl font-bold mb-6">Connect With The Tools <span className="text-gray-400">You Already Use Daily</span></h2>
            <p className="text-gray-500 mb-12">Effortlessly connect with your favorite platforms with our cloud editing experience.</p>
            <EditableButton
              value="Get Started"
              onChange={() => {}}
              className="bg-green-500 text-black"
            />

            {/* Arc of tools */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[600px] h-[300px] border-t-2 border-dashed border-zinc-100 rounded-t-full opacity-50"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none">
               <div className="absolute top-0 left-[10%] w-12 h-12 bg-white rounded-full shadow-lg border border-zinc-100 flex items-center justify-center p-3 animate-pulse">
                  <img src="https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg" alt="" />
               </div>
               <div className="absolute top-[-5%] left-[50%] -translate-x-1/2 w-16 h-16 bg-white rounded-full shadow-2xl border border-zinc-100 flex items-center justify-center p-4">
                  <img src="https://cdn.worldvectorlogo.com/logos/linkedin-icon-2.svg" alt="" />
               </div>
               <div className="absolute top-0 right-[10%] w-12 h-12 bg-white rounded-full shadow-lg border border-zinc-100 flex items-center justify-center p-3 animate-pulse delay-75">
                  <img src="https://cdn.worldvectorlogo.com/logos/google-icon.svg" alt="" />
               </div>
            </div>
         </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
         <div className="text-center mb-16">
            <span className="text-green-600 font-bold text-sm tracking-widest uppercase mb-4 block italic">Our Pricing</span>
            <h2 className="text-4xl font-bold">Flexible Plans That Scale <span className="text-gray-400">With Your Hiring Goals</span></h2>
         </div>
         <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {projectData.pricing?.map((plan, i) => (
               <div key={i} className={`${plan.isPrimary ? 'bg-teal-900 text-white' : 'bg-white'} p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm relative overflow-hidden`}>
                  <EditableText
                    tagName="span"
                    value={plan.title}
                    onChange={(val) => updatePricing(i, { title: val })}
                    className={`${plan.isPrimary ? 'bg-green-500 text-black' : 'bg-green-100 text-green-700'} px-3 py-1 rounded-full text-xs font-bold mb-6 inline-block`}
                  />
                  <div className="flex items-baseline gap-1 mb-6">
                     <span className="text-3xl font-bold">$</span>
                     <EditableText
                        tagName="span"
                        value={plan.price}
                        onChange={(val) => updatePricing(i, { price: val })}
                        className="text-3xl font-bold"
                     />
                     <span className={`${plan.isPrimary ? 'text-teal-100/60' : 'text-gray-400'} text-sm`}>/ Month</span>
                  </div>
                  <EditableButton
                     value={plan.buttonText}
                     onChange={(val) => updatePricing(i, { buttonText: val })}
                     className={`w-full py-4 rounded-xl font-bold mb-8 ${plan.isPrimary ? 'bg-green-500 text-black' : 'bg-black text-white'}`}
                  />
                  <ul className="space-y-4">
                     {plan.features.map((f, fi) => (
                       <li key={fi} className={`flex items-center gap-3 text-sm ${plan.isPrimary ? 'text-teal-50' : 'text-gray-600'}`}>
                         <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.isPrimary ? 'bg-teal-800 text-green-500' : 'bg-green-50 text-green-600'}`}>
                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                         </div>
                         {f}
                       </li>
                     ))}
                  </ul>
               </div>
            ))}
         </div>
      </section>

       {/* Simplified Recap Section */}
       <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto bg-green-50 rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
             <div className="max-w-xl">
                <h2 className="text-3xl font-bold mb-6">Simplify Your Recruitment And <span className="text-gray-400">Maximize Results</span></h2>
                <div className="flex flex-wrap gap-4">
                  <EditableButton
                    value="Get Started"
                    onChange={() => {}}
                    className="bg-green-500 text-black"
                  />
                </div>
             </div>
             <div className="flex-1 w-full max-w-sm">
                <div className="bg-white p-6 rounded-3xl shadow-xl flex flex-col gap-4">
                   <div className="flex items-center gap-3">
                      <img src="https://i.pravatar.cc/40?u=4" className="w-10 h-10 rounded-full" alt="" />
                      <div>
                        <p className="text-sm font-bold">Mila Grogone</p>
                        <p className="text-xs text-gray-400">Product Manager</p>
                      </div>
                   </div>
                   <div className="h-2 bg-gray-100 rounded-full w-full"></div>
                   <div className="h-2 bg-gray-100 rounded-full w-3/4"></div>
                </div>
             </div>
          </div>
       </section>

      {/* Footer */}
      <footer className="py-20 px-12 border-t border-gray-100 mt-20">
         <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
            <div className="col-span-1">
               <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl leading-none">H</span>
                  </div>
                  <span className="font-bold text-xl tracking-tight">Hiralamu</span>
               </div>
               <p className="text-sm text-gray-500 mb-8">Empowering teams to find their perfect workforce partners through data-driven technology and seamless integration.</p>
               <div className="flex gap-2">
                  <input type="email" placeholder="Enter your email" className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500" />
                  <button className="bg-green-500 text-black px-4 py-2 rounded-lg text-sm font-bold">Join Now</button>
               </div>
            </div>
            <div>
               <h5 className="font-bold mb-6">Discovery</h5>
               <ul className="space-y-4 text-sm text-gray-500">
                  <li><a href="#">About</a></li>
                  <li><a href="#">Pricing</a></li>
                  <li><a href="#">Case Study</a></li>
                  <li><a href="#">Global Hub</a></li>
                  <li><a href="#">Career Services</a></li>
               </ul>
            </div>
             <div>
               <h5 className="font-bold mb-6">Platform</h5>
               <ul className="space-y-4 text-sm text-gray-500">
                  <li><a href="#">Hiring Portal</a></li>
                  <li><a href="#">Strategic Classification</a></li>
                  <li><a href="#">Comms Center</a></li>
                  <li><a href="#">Integrations</a></li>
                  <li><a href="#">Billing</a></li>
               </ul>
            </div>
             <div>
               <h5 className="font-bold mb-6">Support</h5>
               <ul className="space-y-4 text-sm text-gray-500">
                  <li><a href="#">Help Center</a></li>
                  <li><a href="#">Settings</a></li>
                  <li><a href="#">Community</a></li>
                  <li><a href="#">Privacy Policy</a></li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto pt-12 border-t border-gray-100 mt-12 text-center text-xs text-gray-400">
            © 2026 Hiralamu. All Rights Reserved. | Terms of Use
         </div>
      </footer>
    </div>
  );
};
