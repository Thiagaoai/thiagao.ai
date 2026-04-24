'use client';

import { useState, FormEvent } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Mensagem é obrigatória';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Mensagem deve ter pelo menos 10 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', company: '', message: '' });
      setErrors({});
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    // spacing: padding responsivo
    <section id="contato" className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* spacing: gap responsivo */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="space-y-6 md:space-y-8 fade-in">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#fafafa] mb-3 md:mb-4">Entre em Contato</h2>
              <p className="text-[#737373] text-base md:text-lg">Vamos conversar sobre como posso ajudar seu negócio a crescer.</p>
            </div>
            <div className="space-y-5 md:space-y-6">
              <div>
                <h3 className="text-[#fafafa] font-semibold mb-2 text-sm uppercase tracking-wide">Email</h3>
                {/* a11y: focus ring + underline offset */}
                <a 
                  href="mailto:dockplus@dockplusai.com" 
                  className="text-[#3b82f6] hover:text-[#2563eb] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] rounded-sm underline-offset-4 hover:underline"
                >
                  dockplus@dockplusai.com
                </a>
              </div>
              <div>
                <h3 className="text-[#fafafa] font-semibold mb-2 text-sm uppercase tracking-wide">Telefone/WhatsApp</h3>
                <a 
                  href="tel:+15085550123" 
                  className="text-[#3b82f6] hover:text-[#2563eb] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] rounded-sm underline-offset-4 hover:underline"
                >
                  +1 (508) 555-0123
                </a>
              </div>
              <div>
                <h3 className="text-[#fafafa] font-semibold mb-2 text-sm uppercase tracking-wide">LinkedIn</h3>
                <a 
                  href="https://linkedin.com/in/thiagodocarmo" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#3b82f6] hover:text-[#2563eb] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] rounded-sm underline-offset-4 hover:underline"
                >
                  linkedin.com/in/thiagodocarmo
                </a>
              </div>
            </div>
          </div>

          <div className="fade-in">
            {/* UX: rounded-xl + padding responsivo */}
            <div className="p-6 md:p-8 bg-[#171717] border border-[#262626] rounded-xl">
              <h3 className="text-xl md:text-2xl font-bold text-[#fafafa] mb-5 md:mb-6">Envie uma Mensagem</h3>
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6" noValidate>
                <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    {/* a11y: htmlFor + id */}
                    <label htmlFor="name" className="block text-sm font-medium text-[#fafafa] mb-2">
                      Nome <span className="text-[#3b82f6]" aria-hidden="true">*</span>
                      <span className="sr-only">(obrigatório)</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Seu nome"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all duration-200 placeholder:text-[#737373]/50 ${
                        errors.name ? 'border-red-500' : 'border-[#262626] hover:border-[#3b82f6]/30'
                      } text-[#fafafa]`}
                    />
                    {errors.name && <p id="name-error" className="mt-1.5 text-sm text-red-500" role="alert">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#fafafa] mb-2">
                      Email <span className="text-[#3b82f6]" aria-hidden="true">*</span>
                      <span className="sr-only">(obrigatório)</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all duration-200 placeholder:text-[#737373]/50 ${
                        errors.email ? 'border-red-500' : 'border-[#262626] hover:border-[#3b82f6]/30'
                      } text-[#fafafa]`}
                    />
                    {errors.email && <p id="email-error" className="mt-1.5 text-sm text-red-500" role="alert">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-[#fafafa] mb-2">Empresa <span className="text-[#737373]">(opcional)</span></label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Nome da sua empresa"
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] hover:border-[#3b82f6]/30 transition-all duration-200 text-[#fafafa] placeholder:text-[#737373]/50"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#fafafa] mb-2">
                    Mensagem <span className="text-[#3b82f6]" aria-hidden="true">*</span>
                    <span className="sr-only">(obrigatório)</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Como posso ajudar você?"
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    className={`w-full px-4 py-3 bg-[#0a0a0a] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] resize-none transition-all duration-200 placeholder:text-[#737373]/50 ${
                      errors.message ? 'border-red-500' : 'border-[#262626] hover:border-[#3b82f6]/30'
                    } text-[#fafafa]`}
                  />
                  {errors.message && <p id="message-error" className="mt-1.5 text-sm text-red-500" role="alert">{errors.message}</p>}
                </div>
                {/* UX: feedback visual com rounded-xl */}
                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm" role="status">
                    ✓ Mensagem enviada com sucesso! Entrarei em contato em breve.
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm" role="alert">
                    ✕ Erro ao enviar mensagem. Por favor, tente novamente.
                  </div>
                )}
                {/* UX: focus ring + transição */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3.5 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#171717]"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar mensagem'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
